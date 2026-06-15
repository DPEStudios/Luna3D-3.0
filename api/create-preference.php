<?php
/* LUNA3D — Endpoint PHP ALTERNATIVO: crea la preferencia MercadoPago.
   Usar SOLO si el hosting fuese PHP (cPanel) en vez de Node/serverless.
   El Access Token va en variable de entorno MP_ACCESS_TOKEN (NUNCA en el codigo). */
header('Content-Type: application/json; charset=utf-8');
if ($_SERVER['REQUEST_METHOD'] !== 'POST') { http_response_code(405); echo json_encode(['error'=>'Metodo no permitido']); exit; }
$token = getenv('MP_ACCESS_TOKEN');
if (!$token) { http_response_code(500); echo json_encode(['error'=>'Falta MP_ACCESS_TOKEN']); exit; }
$siteUrl = getenv('SITE_URL') ?: 'https://luna3d.cl';
$body = json_decode(file_get_contents('php://input'), true) ?: [];
$items = (isset($body['items']) && is_array($body['items'])) ? $body['items'] : [];
if (!count($items)) { http_response_code(400); echo json_encode(['error'=>'Sin items']); exit; }
$pref = [
  'items' => array_map(function($it){ return [
    'title' => (string)($it['title'] ?? 'Producto Luna 3D'),
    'quantity' => max(1, intval($it['quantity'] ?? 1)),
    'unit_price' => round(floatval($it['unit_price'] ?? 0)),
    'currency_id' => $it['currency_id'] ?? 'CLP',
  ]; }, $items),
  'external_reference' => (string)($body['external_reference'] ?? ''),
  'back_urls' => [
    'success' => "$siteUrl/pago-exito.html",
    'failure' => "$siteUrl/pago-fallido.html",
    'pending' => "$siteUrl/pago-pendiente.html",
  ],
  'auto_return' => 'approved',
];
$ch = curl_init('https://api.mercadopago.com/checkout/preferences');
curl_setopt_array($ch, [
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_POST => true,
  CURLOPT_HTTPHEADER => ['Content-Type: application/json', "Authorization: Bearer $token"],
  CURLOPT_POSTFIELDS => json_encode($pref),
]);
$res = curl_exec($ch); $code = curl_getinfo($ch, CURLINFO_HTTP_CODE); curl_close($ch);
$data = json_decode($res, true);
if ($code < 200 || $code >= 300) { http_response_code($code); echo json_encode(['error'=>'MercadoPago rechazo la preferencia','detail'=>$data]); exit; }
echo json_encode(['id'=>$data['id'] ?? null, 'init_point'=>$data['init_point'] ?? null, 'sandbox_init_point'=>$data['sandbox_init_point'] ?? null]);
