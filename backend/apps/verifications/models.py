from django.db import models


class ResidentVerification(models.Model):
    STATUS_CHOICES = [
        ('PENDING',  'Pending'),
        ('VERIFIED', 'Verified'),
        ('REJECTED', 'Rejected'),
    ]

    user                    = models.ForeignKey('accounts.User', on_delete=models.CASCADE, related_name='verifications', db_column='user_id')
    status                  = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    valid_id_path           = models.CharField(max_length=500, null=True, blank=True)
    proof_of_residency_path = models.CharField(max_length=500, null=True, blank=True)
    selfie_path             = models.CharField(max_length=500, null=True, blank=True)
    reviewed_by             = models.ForeignKey('accounts.User', on_delete=models.SET_NULL, null=True, blank=True, related_name='reviewed_verifications', db_column='reviewed_by')
    reviewed_at             = models.DateTimeField(null=True, blank=True)
    remarks                 = models.TextField(null=True, blank=True)
    created_at              = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'resident_verifications'
        ordering = ['-created_at']
