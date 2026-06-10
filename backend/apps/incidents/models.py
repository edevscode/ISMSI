from django.db import models


class Incident(models.Model):
    TYPE_CHOICES = [
        ('PHYSICAL_ALTERCATION', 'Physical Altercation'),
        ('THEFT',                'Theft'),
        ('VANDALISM',            'Vandalism'),
        ('DOMESTIC_DISTURBANCE', 'Domestic Disturbance'),
        ('SUSPICIOUS_ACTIVITY',  'Suspicious Activity'),
        ('NOISE_COMPLAINT',      'Noise Complaint'),
        ('OTHER',                'Other'),
    ]
    PRIORITY_CHOICES = [
        ('LOW',      'Low'),
        ('MEDIUM',   'Medium'),
        ('HIGH',     'High'),
        ('CRITICAL', 'Critical'),
    ]
    STATUS_CHOICES = [
        ('REPORTED',          'Reported'),
        ('ASSIGNED',          'Assigned'),
        ('RESPONDING',        'Responding'),
        ('ON_SCENE',          'On Scene'),
        ('RESOLVED',          'Resolved'),
        ('CLOSED',            'Closed'),
        ('ESCALATED',         'Escalated'),
        ('REFERRED_TO_POLICE','Referred to Police'),
        ('UNABLE_TO_VERIFY',  'Unable to Verify'),
    ]

    incident_number = models.CharField(max_length=50, unique=True)
    reported_by = models.ForeignKey(
        'accounts.User', on_delete=models.SET_NULL, null=True, blank=True,
        related_name='reported_incidents', db_column='reported_by',
    )
    incident_type       = models.CharField(max_length=50, choices=TYPE_CHOICES, default='OTHER')
    other_incident_type = models.CharField(max_length=255, null=True, blank=True)
    priority            = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default='LOW')
    latitude        = models.DecimalField(max_digits=10, decimal_places=8)
    longitude       = models.DecimalField(max_digits=11, decimal_places=8)
    location_source = models.CharField(max_length=10, choices=[('GPS','GPS'),('MANUAL','Manual')], default='GPS')
    resolved_address = models.TextField(null=True, blank=True)
    status          = models.CharField(max_length=30, choices=STATUS_CHOICES, default='REPORTED')
    ai_summary      = models.TextField(null=True, blank=True)
    created_at      = models.DateTimeField(auto_now_add=True)
    updated_at      = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'incidents'
        ordering = ['-created_at']

    def __str__(self):
        return self.incident_number


class IncidentReport(models.Model):
    incident    = models.ForeignKey(Incident, on_delete=models.CASCADE, related_name='reports', db_column='incident_id')
    reported_by = models.ForeignKey('accounts.User', on_delete=models.CASCADE, db_column='reported_by')
    description = models.TextField()
    image_path  = models.CharField(max_length=500, null=True, blank=True)
    created_at  = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'incident_reports'


class IncidentStatusLog(models.Model):
    incident   = models.ForeignKey(Incident, on_delete=models.CASCADE, related_name='status_logs', db_column='incident_id')
    old_status = models.CharField(max_length=30, choices=Incident.STATUS_CHOICES, null=True, blank=True)
    new_status = models.CharField(max_length=30, choices=Incident.STATUS_CHOICES)
    remarks    = models.TextField(null=True, blank=True)
    updated_by = models.ForeignKey('accounts.User', on_delete=models.CASCADE, db_column='updated_by')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'incident_status_logs'


class IncidentAssignment(models.Model):
    ROLE_CHOICES = [('PRIMARY','Primary'),('BACKUP','Backup'),('REINFORCEMENT','Reinforcement')]

    incident        = models.ForeignKey(Incident, on_delete=models.CASCADE, related_name='assignments', db_column='incident_id')
    tanod           = models.ForeignKey('accounts.User', on_delete=models.CASCADE, related_name='assignments', db_column='tanod_id')
    assignment_role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='PRIMARY')
    assigned_at     = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'incident_assignments'


class IncidentParticipant(models.Model):
    ROLE_CHOICES = [('REPORTER','Reporter'),('VICTIM','Victim'),('RESPONDENT','Respondent'),('WITNESS','Witness')]

    incident               = models.ForeignKey(Incident, on_delete=models.CASCADE, related_name='participants', db_column='incident_id')
    user                   = models.ForeignKey('accounts.User', on_delete=models.CASCADE, null=True, blank=True, db_column='user_id')
    unregistered_full_name = models.CharField(max_length=255, null=True, blank=True)
    role                   = models.CharField(max_length=20, choices=ROLE_CHOICES)
    remarks                = models.TextField(null=True, blank=True)

    class Meta:
        db_table = 'incident_participants'


class IncidentAutoNotification(models.Model):
    incident          = models.ForeignKey(Incident, on_delete=models.CASCADE, related_name='auto_notifications', db_column='incident_id')
    tanod             = models.ForeignKey('accounts.User', on_delete=models.CASCADE, db_column='tanod_id')
    distance_meters   = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    tanod_latitude    = models.DecimalField(max_digits=10, decimal_places=8, null=True, blank=True)
    tanod_longitude   = models.DecimalField(max_digits=11, decimal_places=8, null=True, blank=True)
    acknowledged      = models.BooleanField(default=False)
    acknowledged_at   = models.DateTimeField(null=True, blank=True)
    notified_at       = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'incident_auto_notifications'
