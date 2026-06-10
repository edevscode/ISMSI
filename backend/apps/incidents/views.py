from rest_framework.views import APIView
from rest_framework.response import Response

from apps.accounts.permissions import IsAuthenticated, IsAdmin, IsTanod, IsResident, IsAdminOrTanod

from .models import Incident, IncidentReport, IncidentStatusLog, IncidentAssignment
from .serializers import (
    IncidentSerializer, IncidentCreateSerializer,
    IncidentStatusUpdateSerializer, IncidentAssignSerializer,
)
from .utils import generate_incident_number, infer_priority, dispatch_notifications


class IncidentListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        role = user.role.name
        qs = Incident.objects.select_related('reported_by').prefetch_related('reports')

        if role == 'ADMIN':
            pass  # sees all
        elif role == 'TANOD':
            assigned_ids = IncidentAssignment.objects.filter(tanod=user).values_list('incident_id', flat=True)
            qs = qs.filter(id__in=assigned_ids)
        else:  # RESIDENT
            qs = qs.filter(reported_by=user)

        # Optional filters
        if s := request.query_params.get('status'):
            qs = qs.filter(status=s)
        if t := request.query_params.get('type'):
            qs = qs.filter(incident_type=t)

        return Response(IncidentSerializer(qs[:100], many=True).data)

    def post(self, request):
        # Only residents (and unauthenticated via override) can submit
        user = request.user
        if user.role.name not in ('RESIDENT', 'ADMIN'):
            return Response({'error': 'Only residents can submit incident reports.'}, status=403)

        ser = IncidentCreateSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        data = ser.validated_data

        incident = Incident.objects.create(
            incident_number=generate_incident_number(),
            reported_by=user,
            incident_type=data['incident_type'],
            other_incident_type=data.get('other_incident_type'),
            priority=infer_priority(data['incident_type']),
            latitude=data['latitude'],
            longitude=data['longitude'],
            location_source=data.get('location_source', 'GPS'),
            resolved_address=data.get('resolved_address', ''),
            status='REPORTED',
        )

        IncidentReport.objects.create(
            incident=incident,
            reported_by=user,
            description=data['description'],
        )

        dispatch_notifications(incident, reporter_user=user)

        return Response(IncidentSerializer(incident).data, status=201)


class IncidentDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        try:
            inc = Incident.objects.select_related('reported_by').prefetch_related('reports').get(pk=pk)
        except Incident.DoesNotExist:
            return Response({'error': 'Not found.'}, status=404)
        return Response(IncidentSerializer(inc).data)


class IncidentStatusUpdateView(APIView):
    permission_classes = [IsAdminOrTanod]

    def patch(self, request, pk):
        try:
            inc = Incident.objects.get(pk=pk)
        except Incident.DoesNotExist:
            return Response({'error': 'Not found.'}, status=404)

        ser = IncidentStatusUpdateSerializer(data=request.data)
        ser.is_valid(raise_exception=True)

        old_status = inc.status
        inc.status = ser.validated_data['status']
        inc.save(update_fields=['status', 'updated_at'])

        IncidentStatusLog.objects.create(
            incident=inc,
            old_status=old_status,
            new_status=inc.status,
            remarks=ser.validated_data.get('remarks', ''),
            updated_by=request.user,
        )

        # Notify the reporter
        if inc.reported_by:
            from apps.notifications.models import Notification
            Notification.objects.create(
                user=inc.reported_by,
                notification_type='INCIDENT_UPDATE',
                title=f'Incident Update: {inc.incident_number}',
                message=f'Your incident status changed from {old_status} to {inc.status}.',
                reference_type='incident',
                reference_id=inc.id,
            )

        return Response(IncidentSerializer(inc).data)


class IncidentAssignView(APIView):
    permission_classes = [IsAdmin]

    def post(self, request, pk):
        try:
            inc = Incident.objects.get(pk=pk)
        except Incident.DoesNotExist:
            return Response({'error': 'Not found.'}, status=404)

        ser = IncidentAssignSerializer(data=request.data)
        ser.is_valid(raise_exception=True)

        from apps.accounts.models import User
        try:
            tanod = User.objects.get(id=ser.validated_data['tanod_id'], role__name='TANOD', is_active=True)
        except User.DoesNotExist:
            return Response({'error': 'Tanod not found.'}, status=404)

        assignment = IncidentAssignment.objects.create(
            incident=inc,
            tanod=tanod,
            assignment_role=ser.validated_data['assignment_role'],
        )

        inc.status = 'ASSIGNED'
        inc.save(update_fields=['status', 'updated_at'])

        from apps.notifications.models import Notification
        Notification.objects.create(
            user=tanod,
            notification_type='INCIDENT_ASSIGNED',
            title=f'Incident Assignment: {inc.incident_number}',
            message=f'You have been manually assigned to incident {inc.incident_number} as {assignment.assignment_role}.',
            reference_type='incident',
            reference_id=inc.id,
        )

        return Response({'message': f'Tanod {tanod.full_name} assigned as {assignment.assignment_role}.'})
