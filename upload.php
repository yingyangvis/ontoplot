<?php


if (!isset($_FILES['owlfile']))
{
	exit;
}

$time = time();
$origfilename = basename($_FILES["owlfile"]["name"]);
$filename = "{$time}_{$origfilename}";
$fullname = "useronto/{$filename}";

move_uploaded_file($_FILES["owlfile"]["tmp_name"], $fullname);

chdir("useronto");
system("java -jar ../owl2csv.jar {$filename} ./ > /dev/null 2>&1");

echo $fullname;

?>
