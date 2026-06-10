from django.db import models


class Case(models.Model):
    STATUS_CHOICES = [
        ('OPEN',      'Open'),
        ('ONGOING',   'Ongoing'),
        ('RESOLVED',  'Resolved'),
        ('DISMISSED', 'Dismissed'),
    ]

    incident    = models.ForeignKey('incidents.Incident', on_delete=models.CASCADE, related_name='cases', db_column='incident_id')
    case_number = models.CharField(max_length=50, unique=True)
    title       = models.CharField(max_length=255)
    description = models.TextField(null=True, blank=True)
    status      = models.CharField(max_length=20, choices=STATUS_CHOICES, default='OPEN')
    opened_by   = models.ForeignKey('accounts.User', on_delete=models.CASCADE, db_column='opened_by')
    opened_at   = models.DateTimeField(auto_now_add=True)
    closed_at   = models.DateTimeField(null=True, blank=True)
    remarks     = models.TextField(null=True, blank=True)

    class Meta:
        db_table = 'cases'
        ordering = ['-opened_at']

    def __str__(self):
        return self.case_number


class CaseParticipant(models.Model):
    ROLE_CHOICES = [
        ('COMPLAINANT', 'Complainant'),
        ('RESPONDENT',  'Respondent'),
        ('WITNESS',     'Witness'),
        ('MEDIATOR',    'Mediator'),
    ]

    case                   = models.ForeignKey(Case, on_delete=models.CASCADE, related_name='participants', db_column='case_id')
    user                   = models.ForeignKey('accounts.User', on_delete=models.CASCADE, null=True, blank=True, db_column='user_id')
    unregistered_full_name = models.CharField(max_length=255, null=True, blank=True)
    role                   = models.CharField(max_length=20, choices=ROLE_CHOICES)

    class Meta:
        db_table = 'case_participants'
