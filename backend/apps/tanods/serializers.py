from rest_framework import serializers
from .models import TanodDeployment


class TanodDeploymentSerializer(serializers.ModelSerializer):
    tanod_name   = serializers.CharField(source='tanod.full_name', read_only=True)
    phone_number = serializers.CharField(source='tanod.phone_number', read_only=True)

    class Meta:
        model = TanodDeployment
        fields = ['id', 'tanod_id', 'tanod_name', 'phone_number', 'zone_label',
                  'latitude', 'longitude', 'availability_status',
                  'shift_start', 'shift_end', 'last_ping_at']
