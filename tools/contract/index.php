<?php
header('Content-Type: text/plain');
$config = yaml_parse_file($_SERVER['DOCUMENT_ROOT'].'/sites/'.(explode('.',$_SERVER['HTTP_HOST'])[0]).'/config.local.yaml');
$par = [];
function loadpar($arr, $path = '') {
  global $par;
  foreach ($arr as $key => $val) {
    if (is_array($val)) {
      loadpar($val, "$path$key-");
    } else {
      // echo "$path$key=$val\n";

      $par["%$path$key%"] = $val;
    }
  }
}
loadpar($config);
// echo json_encode($par, JSON_PRETTY_PRINT);
$content = file_get_contents('template/Verwerkers-overeenkomst.md');
$content = str_replace(array_keys($par),array_values($par),$content);
echo $content;
