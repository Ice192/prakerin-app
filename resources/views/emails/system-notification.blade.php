<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $subjectLine }}</title>
</head>
<body style="font-family: Arial, sans-serif; color: #111827; line-height: 1.6; margin: 0; padding: 24px;">
    <p>Hello {{ $recipientName }},</p>

    <p>{!! nl2br(e($messageBody)) !!}</p>

    <p>Best regards,<br>Internship Management System</p>
</body>
</html>
