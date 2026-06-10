from django.db import models


class DocumentType(models.Model):
    name                   = models.CharField(max_length=255)
    description            = models.TextField(null=True, blank=True)
    requires_case_clearance = models.BooleanField(default=False)
    is_active              = models.BooleanField(default=True)

    class Meta:
        db_table = 'document_types'

    def __str__(self):
        return self.name


class DocumentRequest(models.Model):
    STATUS_CHOICES = [
        ('PENDING',          'Pending'),
        ('UNDER_REVIEW',     'Under Review'),
        ('APPROVED',         'Approved'),
        ('REJECTED',         'Rejected'),
        ('READY_FOR_PICKUP', 'Ready for Pickup'),
        ('RELEASED',         'Released'),
    ]

    request_number      = models.CharField(max_length=50, unique=True)
    user                = models.ForeignKey('accounts.User', on_delete=models.CASCADE, related_name='document_requests', db_column='user_id')
    document_type       = models.ForeignKey(DocumentType, on_delete=models.CASCADE, db_column='document_type_id')
    status              = models.CharField(max_length=30, choices=STATUS_CHOICES, default='PENDING')
    generated_file_path = models.CharField(max_length=500, null=True, blank=True)
    created_at          = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'document_requests'
        ordering = ['-created_at']


class DocumentRequestLog(models.Model):
    STATUS_CHOICES = DocumentRequest.STATUS_CHOICES

    document_request = models.ForeignKey(DocumentRequest, on_delete=models.CASCADE, related_name='logs', db_column='document_request_id')
    old_status       = models.CharField(max_length=30, choices=STATUS_CHOICES, null=True, blank=True)
    new_status       = models.CharField(max_length=30, choices=STATUS_CHOICES)
    remarks          = models.TextField(null=True, blank=True)
    updated_by       = models.ForeignKey('accounts.User', on_delete=models.CASCADE, db_column='updated_by')
    created_at       = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'document_request_logs'
