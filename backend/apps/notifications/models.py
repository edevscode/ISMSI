from django.db import models


class Notification(models.Model):
    TYPE_CHOICES = [
        ('INCIDENT_NEARBY',     'Incident Nearby'),
        ('INCIDENT_ASSIGNED',   'Incident Assigned'),
        ('INCIDENT_UPDATE',     'Incident Update'),
        ('DOCUMENT_UPDATE',     'Document Update'),
        ('VERIFICATION_UPDATE', 'Verification Update'),
        ('GENERAL',             'General'),
    ]

    user              = models.ForeignKey('accounts.User', on_delete=models.CASCADE, related_name='notifications', db_column='user_id')
    notification_type = models.CharField(max_length=50, choices=TYPE_CHOICES, default='GENERAL')
    title             = models.CharField(max_length=255)
    message           = models.TextField()
    reference_type    = models.CharField(max_length=50, null=True, blank=True)
    reference_id      = models.BigIntegerField(null=True, blank=True)
    is_read           = models.BooleanField(default=False)
    created_at        = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'notifications'
        ordering = ['-created_at']
