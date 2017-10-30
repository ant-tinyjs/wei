<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta content="yes" name="apple-touch-fullscreen">
<meta content="telephone=no,email=no" name="format-detection">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black" />
<meta name="viewport" content="width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1, user-scalable=no, shrink-to-fit=no">
<title><?=pageTitle ?></title>
<script>
  document.documentElement.style.fontSize = document.documentElement["clientWidth"] * 100 / 375 + 'px';
  if (navigator.userAgent.indexOf('iPad') > -1) {
    document.documentElement.style.fontSize = '200px';
  }
</script>
<?=extCSS ?>
</head>
<body>
