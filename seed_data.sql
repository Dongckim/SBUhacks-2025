USE secure_sbu;

INSERT INTO users (user_id, username, email) 
VALUES (1, 'testuser', 'testuser@example.com')
ON DUPLICATE KEY UPDATE username = username;

INSERT INTO reports (
    ticket_id, 
    issue_type, 
    title,
    description,
    status, 
    submitted_by_user_id, 
    created_at
) VALUES
('SBU-84391', 'Suspicious Individual', 'Suspicious person near library entrance', 'Observed an individual acting suspiciously near the main library entrance around 2 PM. Person was loitering and attempting to access restricted areas.', 'Resolved', 1, '2023-10-26 14:00:00'),
('SBU-84390', 'Unsecured Access Point', 'Unlocked door in Engineering building', 'Found an unlocked side door in the Engineering building that should have been secured. Door was left open overnight.', 'In Progress', 1, '2023-10-25 18:30:00'),
('SBU-84389', 'Lost ID Badge', 'Missing security badge', 'Lost my security badge somewhere on campus. Last seen in the Student Center. Need replacement.', 'Pending Review', 1, '2023-10-24 13:15:00'),
('SBU-84388', 'IT Security Concern', 'Suspicious email activity', 'Received multiple suspicious emails asking for login credentials. Suspecting phishing attempt.', 'Resolved', 1, '2023-10-23 15:05:00'),
('SBU-84387', 'Suspicious Individual', 'Unknown person in restricted area', 'Saw an unknown person attempting to access the server room without proper authorization.', 'Pending Review', 1, '2023-10-22 10:20:00'),
('SBU-84386', 'Unsecured Access Point', 'Broken lock on side entrance', 'The lock on the side entrance of the Science building appears to be broken and not securing properly.', 'In Progress', 1, '2023-10-21 16:45:00'),
('SBU-84385', 'Lost ID Badge', 'Stolen badge report', 'My security badge was stolen from my backpack. Immediately reported to campus security.', 'Resolved', 1, '2023-10-20 09:30:00'),
('SBU-84384', 'IT Security Concern', 'Unauthorized access attempt', 'Detected multiple failed login attempts on my account from unknown IP address.', 'Resolved', 1, '2023-10-19 11:15:00');

SELECT COUNT(*) as total_reports FROM reports;
SELECT ticket_id, issue_type, status, created_at FROM reports ORDER BY created_at DESC;

