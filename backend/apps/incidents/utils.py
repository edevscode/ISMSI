import math
from datetime import datetime


def haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    R = 6371.0
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    a = (math.sin((phi2 - phi1) / 2) ** 2
         + math.cos(phi1) * math.cos(phi2) * math.sin(math.radians(lon2 - lon1) / 2) ** 2)
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


def generate_incident_number() -> str:
    from .models import Incident
    prefix = f'INC-{datetime.now().strftime("%Y%m%d")}-'
    last = Incident.objects.filter(incident_number__startswith=prefix).order_by('-incident_number').first()
    seq = 1
    if last:
        try:
            seq = int(last.incident_number.split('-')[-1]) + 1
        except (ValueError, IndexError):
            pass
    return f'{prefix}{seq:04d}'


PRIORITY_MAP = {
    'PHYSICAL_ALTERCATION': 'HIGH',
    'THEFT':                'HIGH',
    'VANDALISM':            'MEDIUM',
    'DOMESTIC_DISTURBANCE': 'MEDIUM',
    'SUSPICIOUS_ACTIVITY':  'LOW',
    'NOISE_COMPLAINT':      'LOW',
    'OTHER':                'LOW',
}


def infer_priority(incident_type: str) -> str:
    return PRIORITY_MAP.get(incident_type, 'LOW')


def dispatch_notifications(incident, reporter_user=None) -> None:
    """
    Creates:
    1. An INCIDENT_UPDATE notification for every active ADMIN user.
    2. An INCIDENT_ASSIGNED notification + IncidentAutoNotification for the
       nearest available Tanod.
    """
    from django.utils import timezone
    from apps.accounts.models import Role, User
    from apps.notifications.models import Notification
    from apps.tanods.models import TanodDeployment
    from .models import IncidentAutoNotification

    reporter_label = reporter_user.full_name if reporter_user else 'an anonymous user'
    inc_lat = float(incident.latitude)
    inc_lon = float(incident.longitude)

    # ── Notify admins ────────────────────────────────────────────────────────
    try:
        admin_role = Role.objects.get(name='ADMIN')
        admin_users = User.objects.filter(role=admin_role, is_active=True)
        Notification.objects.bulk_create([
            Notification(
                user=admin,
                notification_type='INCIDENT_UPDATE',
                title=f'New Incident Reported: {incident.incident_number}',
                message=(
                    f'{reporter_label.title()} reported a '
                    f'{incident.get_incident_type_display()} incident. '
                    f'Priority: {incident.priority}. Status: REPORTED.'
                ),
                reference_type='incident',
                reference_id=incident.id,
            )
            for admin in admin_users
        ])
    except Role.DoesNotExist:
        pass

    # ── Find & notify nearest available Tanod ────────────────────────────────
    now = timezone.now()
    active_deps = TanodDeployment.objects.select_related('tanod').filter(
        availability_status='AVAILABLE',
        shift_start__lte=now,
    ).filter(
        models_shift_end_filter(now)
    )

    nearest_dep = None
    nearest_km = float('inf')
    for dep in active_deps:
        d = haversine_km(inc_lat, inc_lon, float(dep.latitude), float(dep.longitude))
        if d < nearest_km:
            nearest_km = d
            nearest_dep = dep

    if nearest_dep:
        Notification.objects.create(
            user=nearest_dep.tanod,
            notification_type='INCIDENT_ASSIGNED',
            title=f'Respond Required: {incident.incident_number}',
            message=(
                f'You are the closest available tanod ({nearest_km:.2f} km). '
                f'Incident: {incident.get_incident_type_display()} — '
                f'Priority {incident.priority}. Please respond immediately.'
            ),
            reference_type='incident',
            reference_id=incident.id,
        )
        IncidentAutoNotification.objects.create(
            incident=incident,
            tanod=nearest_dep.tanod,
            distance_meters=round(nearest_km * 1000, 2),
            tanod_latitude=nearest_dep.latitude,
            tanod_longitude=nearest_dep.longitude,
        )


def models_shift_end_filter(now):
    """Returns a Q object for shift_end null-or-future."""
    from django.db.models import Q
    return Q(shift_end__isnull=True) | Q(shift_end__gte=now)
