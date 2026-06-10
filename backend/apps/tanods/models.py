from django.db import models


class TanodDeployment(models.Model):
    AVAILABILITY_CHOICES = [
        ('AVAILABLE',  'Available'),
        ('RESPONDING', 'Responding'),
        ('ON_BREAK',   'On Break'),
        ('OFF_DUTY',   'Off Duty'),
    ]

    tanod               = models.ForeignKey('accounts.User', on_delete=models.CASCADE, related_name='deployments', db_column='tanod_id')
    zone_label          = models.CharField(max_length=255, null=True, blank=True)
    latitude            = models.DecimalField(max_digits=10, decimal_places=8)
    longitude           = models.DecimalField(max_digits=11, decimal_places=8)
    availability_status = models.CharField(max_length=20, choices=AVAILABILITY_CHOICES, default='AVAILABLE')
    shift_start         = models.DateTimeField()
    shift_end           = models.DateTimeField(null=True, blank=True)
    last_ping_at        = models.DateTimeField(null=True, blank=True)
    created_at          = models.DateTimeField(auto_now_add=True)
    updated_at          = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'tanod_deployments'
