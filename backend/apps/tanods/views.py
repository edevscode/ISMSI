from django.utils import timezone
from django.db.models import Q
from rest_framework.views import APIView
from rest_framework.response import Response

from apps.accounts.permissions import IsAuthenticated, IsAdmin, IsTanod, IsAdminOrTanod
from .models import TanodDeployment
from .serializers import TanodDeploymentSerializer


class TanodListView(APIView):
    permission_classes = [IsAdmin]

    def get(self, request):
        now = timezone.now()
        deps = TanodDeployment.objects.select_related('tanod').filter(
            availability_status__in=['AVAILABLE', 'RESPONDING'],
            shift_start__lte=now,
        ).filter(Q(shift_end__isnull=True) | Q(shift_end__gte=now))
        return Response(TanodDeploymentSerializer(deps, many=True).data)


class TanodPingView(APIView):
    """Tanod app pings to update live location and availability."""
    permission_classes = [IsTanod]

    def post(self, request):
        user = request.user
        lat  = request.data.get('latitude')
        lon  = request.data.get('longitude')
        availability = request.data.get('availability_status', 'AVAILABLE')

        if not lat or not lon:
            return Response({'error': 'latitude and longitude are required.'}, status=400)

        now = timezone.now()
        dep = TanodDeployment.objects.filter(
            tanod=user,
            availability_status__in=['AVAILABLE', 'RESPONDING'],
            shift_start__lte=now,
        ).filter(Q(shift_end__isnull=True) | Q(shift_end__gte=now)).first()

        if dep:
            dep.latitude = lat
            dep.longitude = lon
            dep.availability_status = availability
            dep.last_ping_at = now
            dep.save(update_fields=['latitude', 'longitude', 'availability_status', 'last_ping_at', 'updated_at'])
        else:
            TanodDeployment.objects.create(
                tanod=user,
                latitude=lat,
                longitude=lon,
                availability_status=availability,
                shift_start=now,
                last_ping_at=now,
            )

        return Response({'ok': True})


class TanodStatusUpdateView(APIView):
    """Let a tanod update their own availability (e.g. go on break)."""
    permission_classes = [IsTanod]

    def patch(self, request):
        new_status = request.data.get('availability_status')
        if not new_status:
            return Response({'error': 'availability_status required.'}, status=400)

        now = timezone.now()
        updated = TanodDeployment.objects.filter(
            tanod=request.user,
            shift_start__lte=now,
        ).filter(Q(shift_end__isnull=True) | Q(shift_end__gte=now)).update(
            availability_status=new_status,
            last_ping_at=now,
        )
        return Response({'updated': updated})
