<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);
error_reporting(E_ALL & ~E_NOTICE & ~E_WARNING & ~E_STRICT & ~E_DEPRECATED);


$package = json_decode(file_get_contents(getcwd().'/dist/package.json'));
$version = $package->version;
// require_once('icon.php');

function compress_code ($content) {
  global  $no_space_chars;
  $content = implode(' ', array_filter( array_map( function($content){
    $content = trim($content);
    // $content = preg_replace('/\t/', '', $content);
    $content = preg_replace('/,\}/', '}', $content);
    return $content;
  }, explode("\n", $content) ), function($val){return trim($val)==='' ? false : true;}) );
  // $content = implode(' ', array_filter(explode(' ',$content), function($val){return trim($val)==='' ? false : true;}));
  $content = preg_replace("/ ($no_space_chars)/", "$1", $content);
  $content = preg_replace("/($no_space_chars) /", "$1", $content);
  $content = preg_replace("/,\}/", "}", $content);
  $content = preg_replace("/,\]/", "]", $content);
  return $content;
}
function compress_js($content) {
  $chars = str_split($content);
  $code = $s = '';
  for ($x = 0; $x <= count($chars); $x++) {
    if ($chars[$x] === '/') {
      if ($chars[$x+1] === '/' && $chars[$x-1] !== '\\') {
        for ($x; $x <= count($chars); $x++) {
          if ($chars[$x+1] === "\n") {
            break;
          }
        }
        continue;
      }
      if ($chars[$x+1] === '*') {
        for ($x; $x <= count($chars); $x++) {
          if ($chars[$x] === '/' && $chars[$x-1] === '*') {
            break;
          }
        }
        continue;
      }
      if ($chars[$x-1] === '(') {
        $s .= compress_code(trim($code));
        $code = '';
        // $code .= '<<<';
        $s .= $chars[$x];
        for ($x++; $x <= count($chars); $x++) {
          $s .= $chars[$x];
          if ($chars[$x] === '/' && ( $chars[$x-1] !== '\\' || ( $chars[$x-1] === '\\' && $chars[$x-2] === '\\' ))) {
            // $code .= '>>>';
            break;
          }
        }
        continue;
      }
    }
    if (in_array($chars[$x], ['"','`',"'"])) {
      $s .= compress_code(trim($code));
      $code = '';
      // $s .= '<<<';
      $s .= $chars[$x];
      $b = $chars[$x];
      for ($x++; $x <= count($chars); $x++) {
        $s .= $chars[$x];
        if ($chars[$x] === $b && ($chars[$x-1] !== '\\' || $chars[$x-2] === '\\') ) {
          // $s .= '>>>';
          break;
        }
      }
      continue;
    }
    $code .= $chars[$x];
  }
  $s .= compress_code($code);
  $s = preg_replace("/console.debug\(.*?\);/", "", $s);
  $s = preg_replace("/console.log\(.*?\);/", "", $s);
  // $s = preg_replace("/console.log(.*?)/", "", $s);
  $s = preg_replace("/;\}/", "}", $s);
  $s = preg_replace("/,\)/", ")", $s);
  $s = preg_replace("/,\)/", ")", $s);
  // die($s);
  return $s;
}
function compress_css($content) {
  $content = preg_replace('/  /', ' ', $content);
  $content = compress_js($content, ':|;|\{|\}');
  $content = str_replace("{ ", "{", $content
  );
  $content = preg_replace('/; /', ';', $content);
  // $content = str_replace("}","}\r\n", $content);
  return $content;
}
$no_space_chars_config = [
  'css'=> '\{|\}',
  'js'=> ';|>|<|\*|\?|\+|\-|\&|:|,|!|=|\)|\(|\{|\}|\/|\|',
];

$compressed_file = [];
function file_put($sourcename, $destname, $content) {
  global $package;
  // $sdkpath = realpath("../../../sdk/api/release");
  // $releasepath = realpath("../release");
  // die($releasepath);
  // echo $package->version;
  // $basename = explode('/', $fname);
  // $basename = array_pop($basename);
  // $content = "/** $basename\n * @version $package->version\n * @released ".date('d-m-Y H:i:s')."\n * copywright (C) 1991 Alicon -- https://alicon.aliconnect.nl \n */\n".$content;
  // die(realpath("..") . $fname);
  // die(realpath("../../../sdk/api") . $fname);
  // $destname = $path . $fname;
  echo "$sourcename > $destname<br>";
  return;
  file_put_contents($destname, $content);
  // die($destname. realpath($destname));
  // file_put_contents("../../../sdk/api" . $fname, $content);
  // die('done');
}
// die($releasepath);
// die('aaa');

$ext = pathinfo($argv[1], PATHINFO_EXTENSION);
$no_space_chars = $no_space_chars_config[$ext];
$func_name = "compress_$ext";
// die($func_name);
$content = '';
for ($i = 2; $i < count($argv); $i++)  {
  $sourcename = realpath(getcwd().'/'.$argv[$i]);
  // echo $argv[$i] .$sourcename.PHP_EOL;
  // $content. = $func_name(file_get_contents($sourcename));
  $content .= "/** $sourcename */\n";
  $content .= $func_name(file_get_contents($sourcename)).PHP_EOL;
}
$fname = "/aim/aliconnect/npm/$package->name@$package->version/".$argv[1];
$path = pathinfo($fname, PATHINFO_DIRNAME);
mkdir($path, 0777, true);
file_put_contents($fname, $content);


die($fname.PHP_EOL);
