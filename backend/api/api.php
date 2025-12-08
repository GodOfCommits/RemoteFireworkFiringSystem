<?php

// -----------------------------------------
// ----------------------------------------- HELPER FUNCTIONS
// -----------------------------------------

// JSON response function
function jr($text, $status)
{
    http_response_code($status ? 200 : 400);
    return json_encode([
        'status' => $status,
        'message' => $text
    ]);
}

// Check request method
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
    $filename = 'info.json';
    if (file_exists($filename)) {
        $fileContent = file_get_contents($filename);
        $json = json_decode($fileContent, true);
        $json['isArmed'] = true;
        file_put_contents($filename, json_encode($json));
        die(jr('Device armed', true));
    } else {
        die(jr('info.json not found', false));
    }
}

function disarm()
{
    $filename = 'info.json';
    if (file_exists($filename)) {
        $fileContent = file_get_contents($filename);
        $json = json_decode($fileContent, true);
        $json['isArmed'] = false;
        file_put_contents($filename, json_encode($json));
        die(jr('Device disarmed', true));
    } else {
        die(jr('info.json not found', false));
    }
}

function isArmed()
{
    $filename = 'info.json';
    if (file_exists($filename)) {
        $fileContent = file_get_contents($filename);
        $json = json_decode($fileContent, true);
        die(json_encode(['isArmed' => (bool)$json['isArmed']]));
    } else {
        die(jr('info.json not found', false));
    }
}

// -----------------------------------------
// ----------------------------------------- FIRE ENDPOINTS
// -----------------------------------------

function fireSingle($url)
{
    if (isArmed() == false) {
        die(jr('Device is disarmed', false));
    }
    if (count($url) !== 2) {
        die(jr('Please specify a channel to fire', false));
    }
    if (!is_numeric($url[1])) {
        die(jr('Please specify the channel number', false));
    }

    // execute the python script to fire channel x
    exec("sudo /usr/bin/python /var/www/html/hardwareAdapter.py fire {$url[1]}", $output, $r_code);
    if ($r_code !== 0) {
        // if the python script returned an error code (code other than 0), print error message, if provided by python script.
        die(jr(isset($output[0]) ? $output[0] : 'something went wrong', false));
    }

    die(jr('ok', true));
}

function fireAll($url)
{
    if (isArmed() == false) {
        die(jr('Device is disarmed', false));
    }
    if (count($url) !== 1) {
        die(jr('Please specify nothing after the endpoint', false));
    }

    // execute the python script to fire all channels
    exec("sudo /usr/bin/python /var/www/html/hardwareAdapter.py fireall", $output, $r_code);

    if ($r_code !== 0) {
        // if the python script returned an error code (code other than 0), print error message, if provided by python script.
        die(jr(isset($output[0]) ? $output[0] : 'something went wrong', false));
    }

    die(jr('ok', true));
}

function fireSequence($url)
{
    if (isArmed() == false) {
        die(jr('Device is disarmed', false));
    }
    if (count($url) !== 2) {
        die(jr('Please specify a sequence ID to fire', false));
    }

    $sequenceId = $url[1];

    // Validate sequence ID (alphanumeric and underscore only for security)
    if (!preg_match('/^[a-zA-Z0-9_]+$/', $sequenceId)) {
        die(jr('Invalid sequence ID format', false));
    }

    // execute the python script to fire the sequence
    exec("sudo /usr/bin/python /var/www/html/hardwareAdapter.py firesequence {$sequenceId}", $output, $r_code);
    if ($r_code !== 0) {
        // if the python script returned an error code (code other than 0), print error message, if provided by python script.
        die(jr(isset($output[0]) ? $output[0] : 'something went wrong', false));
    }

    die(jr('ok', true));
}



// -----------------------------------------
// ----------------------------------------- CONFIGURATION ENDPOINTS
// -----------------------------------------

function saveConfiguration()
{
    // Read incoming JSON
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);
    if (!isset($data['configuration'])) {
        die(jr('No configuration provided', false));
    }

    // Save to sequences.json
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

// the pathinfo (the part after *.php/ like: server.com/api.php/endpoint) must be set to something
if (!isset($_SERVER['PATH_INFO'])) {
    die(jr('Please specify an endpoint', false));
}

// split different parts of endpoint into an array api.php/1/2/3/4 -> [1,2,3,4]
$url = rtrim($_SERVER['PATH_INFO'], '/'); // remove last slash
$url = substr($url, 1); // remove first slash
$url = filter_var($url, FILTER_SANITIZE_URL); // sanitize URL
$url = explode('/', $url);

if ($url[0] == '') {
    die(jr('Please specify an endpoint', false));
}

// switch over all possible endpoints
switch ($url[0]) {
    case 'isarmed':
        checkRequestMethod('GET');
        isArmed();
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
        fireSingle($url);
        break;

    case 'fireall':
        checkRequestMethod('POST');
        fireAll($url);
        break;

    case 'firesequence':
        checkRequestMethod('POST');
        fireSequence($url);
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
