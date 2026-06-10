from rest_framework import serializers
from .models import Incident, IncidentReport, IncidentAssignment, IncidentStatusLog


class IncidentReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = IncidentReport
        fields = ['id', 'description', 'image_path', 'created_at']


class IncidentSerializer(serializers.ModelSerializer):
    reporter_name = serializers.SerializerMethodField()
    reports       = IncidentReportSerializer(many=True, read_only=True)

    class Meta:
        model = Incident
        fields = [
            'id', 'incident_number', 'incident_type', 'other_incident_type', 'priority', 'status',
            'latitude', 'longitude', 'location_source', 'resolved_address',
            'ai_summary', 'created_at', 'updated_at', 'reporter_name', 'reports',
        ]

    def get_reporter_name(self, obj):
        return obj.reported_by.full_name if obj.reported_by else 'Anonymous'


class IncidentCreateSerializer(serializers.Serializer):
    incident_type       = serializers.ChoiceField(choices=[c[0] for c in Incident.TYPE_CHOICES])
    other_incident_type = serializers.CharField(required=False, allow_blank=True, default=None)
    description         = serializers.CharField()
    latitude            = serializers.DecimalField(max_digits=10, decimal_places=8)
    longitude           = serializers.DecimalField(max_digits=11, decimal_places=8)
    location_source     = serializers.ChoiceField(choices=['GPS', 'MANUAL'], default='GPS')
    resolved_address    = serializers.CharField(required=False, allow_blank=True)

    def validate(self, data):
        if data['incident_type'] == 'OTHER':
            if not (data.get('other_incident_type') or '').strip():
                raise serializers.ValidationError(
                    {'other_incident_type': 'Please specify the incident type when selecting Other.'}
                )
        else:
            data['other_incident_type'] = None
        return data


class IncidentStatusUpdateSerializer(serializers.Serializer):
    status  = serializers.ChoiceField(choices=[c[0] for c in Incident.STATUS_CHOICES])
    remarks = serializers.CharField(required=False, allow_blank=True)


class IncidentAssignSerializer(serializers.Serializer):
    tanod_id        = serializers.IntegerField()
    assignment_role = serializers.ChoiceField(choices=[c[0] for c in IncidentAssignment.ROLE_CHOICES], default='PRIMARY')
