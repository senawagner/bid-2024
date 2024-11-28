<?php

function getApiVersion() {
    return 'v1';
}

function validateApiVersion($version) {
    $validVersions = ['v1'];
    if (!in_array($version, $validVersions)) {
        throw new Exception('Versão da API inválida');
    }
}

function apiResponse($data, $success = true, $statusCode = 200) {
    http_response_code($statusCode);
    return json_encode([
        'success' => $success,
        'data' => $data
    ]);
} 