<?php

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

// -----------------------------------------
// ----------------------------------------- HELPER FUNCTIONS
// -----------------------------------------

function jr($text, $status)
{
    http_response_code($status ? 200 : 400);
    // Ensure the response is always JSON
    header('Content-Type: application/json');
    return json_encode([
        'status' => $status,
        'message' => $text
    ]);
}

function checkRequestMethod($method)
{
    if ($_SERVER['REQUEST_METHOD'] !== $method) {
        die(jr('Please use the method ' . strtoupper($method), false));
    }
}

// -----------------------------------------
// ----------------------------------------- ARM/DISARM ENDPOINTS
// -----------------------------------------

function arm()
{
    $filename = __DIR__ . '/info.json';
    $json = file_exists($filename) ? json_decode(file_get_contents($filename), true) : [];
    $json['isArmed'] = true;
    file_put_contents($filename, json_encode($json));
    die(jr('Device armed', true));
}

function disarm()
{
    $filename = __DIR__ . '/info.json';
    $json = file_exists($filename) ? json_decode(file_get_contents($filename), true) : [];
    $json['isArmed'] = false;
    file_put_contents($filename, json_encode($json));
    die(jr('Device disarmed', true));
}

function isArmed()
{
    $filename = __DIR__ . '/info.json';
    if (!file_exists($filename)) {
        return false;
    }
    $fileContent = file_get_contents($filename);
    $json = json_decode($fileContent, true);
    return isset($json['isArmed']) && $json['isArmed'] === true;
}

// -----------------------------------------
// ----------------------------------------- FIRE ENDPOINTS
// -----------------------------------------

function fireSingle($channel)
{
    if (isArmed() == false) {
        die(jr('Device is disarmed', false));
    }
    exec("sudo /usr/bin/python3 /var/www/html/hardwareAdapter.py fire {$channel} 2>&1", $output, $r_code);
    if ($r_code !== 0) {
        // FIX: Join all lines of the output to see the full traceback
        $errorMessage = !empty($output) ? implode("\n", $output) : 'Python script failed with no output';
        die(jr($errorMessage, false));
    }
    die(jr('ok', true));
}

function fireAll()
{
    if (isArmed() == false) {
        die(jr('Device is disarmed', false));
    }
    exec("sudo /usr/bin/python3 /var/www/html/hardwareAdapter.py fireall 2>&1", $output, $r_code);
    if ($r_code !== 0) {
        // FIX: Join all lines of the output to see the full traceback
        $errorMessage = !empty($output) ? implode("\n", $output) : 'Python script failed with no output';
        die(jr($errorMessage, false));
    }
    die(jr('ok', true));
}

function fireSequence($sequenceId)
{
    if (isArmed() == false) {
        die(jr('Device is disarmed', false));
    }
    if (!preg_match('/^[a-zA-Z0-9_]+$/', $sequenceId)) {
        die(jr('Invalid sequence ID format', false));
    }
    exec("sudo /usr/bin/python3 /var/www/html/hardwareAdapter.py firesequence {$sequenceId} 2>&1", $output, $r_code);
    if ($r_code !== 0) {
        // FIX: Join all lines of the output to see the full traceback
        $errorMessage = !empty($output) ? implode("\n", $output) : 'Python script failed with no output';
        die(jr($errorMessage, false));
    }
    die(jr('ok', true));
}

// -----------------------------------------
// ----------------------------------------- CONFIGURATION ENDPOINTS
// -----------------------------------------

function saveConfiguration()
{
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);
    if (!isset($data['configuration'])) {
        die(jr('No configuration provided', false));
    }
    $filename = 'sequences.json';
    $result = file_put_contents($filename, json_encode($data['configuration'], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
    if ($result === false) {
        die(jr('Failed to save configuration', false));
    }
    die(jr('Configuration saved successfully', true));
}

function getConfiguration()
{
    $filename = 'sequences.json';
    if (!file_exists($filename)) {
        die(jr('No configuration found', false));
    }
    $fileContent = file_get_contents($filename);
    header('Content-Type: application/json');
    die($fileContent);
}

// -----------------------------------------
// ----------------------------------------- ROUTER
// -----------------------------------------

if (!isset($_GET['endpoint'])) {
    die(jr('Please specify an endpoint', false));
}

$endpoint = $_GET['endpoint'];
$value = isset($_GET['value']) ? $_GET['value'] : null;

switch ($endpoint) {
    case 'isarmed':
        checkRequestMethod('GET');
        http_response_code(200);
        die(json_encode(['isArmed' => isArmed()]));
        break;

    case 'arm':
        checkRequestMethod('POST');
        arm();
        break;

    case 'disarm':
        checkRequestMethod('POST');
        disarm();
        break;

    case 'fire':
        checkRequestMethod('POST');
        if ($value === null || !is_numeric($value)) {
            die(jr('Please specify the channel number via a value parameter', false));
        }
        fireSingle($value);
        break;

    case 'fireall':
        checkRequestMethod('POST');
        fireAll();
        break;

    case 'firesequence':
        checkRequestMethod('POST');
        if ($value === null) {
            die(jr('Please specify a sequence ID via a value parameter', false));
        }
        fireSequence($value);
        break;

    case 'save-configuration':
        checkRequestMethod('POST');
        saveConfiguration();
        break;

    case 'get-configuration':
        checkRequestMethod('GET');
        getConfiguration();
        break;

    default:
        die(jr('Please specify a valid endpoint', false));
        break;
}
