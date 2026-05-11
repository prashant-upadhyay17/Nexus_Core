<?php
$p = 'emp123';
$h = password_hash($p, PASSWORD_BCRYPT);
echo "Hash: $h\n";
echo "Verify: " . (password_verify($p, $h) ? 'Success' : 'Fail') . "\n";
