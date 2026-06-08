INSERT INTO participants (
    participant_id,
    name,
    initials,
    fun_fact,
    role,
    pronouns,
    age,
    hobbies,
    onboarding_status
) VALUES
    (
        9,
        'Alice',
        'A',
        'I love morning photography and catching the early light.',
        'participant',
        'she/her',
        '22',
        'Photography, Hiking',
        'complete'
    ),
    (
        10,
        'Bob',
        'B',
        'I play acoustic guitar and love listening to folk music.',
        'participant',
        'he/him',
        '24',
        'Guitar, Reading',
        'complete'
    );

SELECT setval(
  pg_get_serial_sequence('participants', 'participant_id'),
  10,
  true
);

INSERT INTO group_participants (
    group_id,
    participant_id
) VALUES 
  (1, 9),
  (1, 10);
