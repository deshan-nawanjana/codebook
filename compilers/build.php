<?php

    // backend checker respond
    if(isset($_GET['check'])) { echo('CODEBOOK'); exit(); }

    // content type headr
    header('Content-Type: application/json; charset=utf-8');

    // get post request data
    $post = json_decode(file_get_contents('php://input'), true);
    // get compilers data
    $comp = json_decode(file_get_contents("..\\index.json"), true);

    // get markdown uuid
    $uuid = $post['uuid'];
    // get language code
    $lang = $post['lang'];
    // get code segment
    $code = $post['code'];

    // for each compiler
    foreach($comp as $name => $cdat) {
        // for each language in compiler
        foreach($cdat['languages'] as $ldat) {
            // check with language codes
            if(in_array($lang, $ldat['code'])) {
                // get compiler data
                $comp_name = $name;
                $comp_data = $cdat;
                $lang_data = $ldat;
            }
        }
    }

    // method to send response
    function json($data, $time, $comp, $error = false) {
        echo json_encode(
            array(
                "output" => array(
                    "data" => $data,
                    "time" => $time,
                    "error" => $error
                ),
                "compiler" => $comp
            )
        );
        exit();
    }

    // method to save text file
    function save($file, $data) {
        // get execution path
        global $exec_path;
        // save into file
        file_put_contents($exec_path . $file, $data);
    }

    // method to read text file
    function read($file) {
        // get execution path
        global $exec_path;
        // return file content
        return file_get_contents($exec_path . $file);
    }

    // method to get curl response
    function curl($path) {
        // create curl
        $reqs = curl_init($_SERVER["HTTP_REFERER"] . $path);
        // settings array
        $opts = array(CURLOPT_RETURNTRANSFER => true); 
        // add settings to curl
        curl_setopt_array($reqs, $opts);
        // get curl response
        $resp = curl_exec($reqs);
        // close curl
        curl_close($reqs);
        // return response
        return $resp;
    }

    // execution path
    $exec_path = "cache\\" . $post['uuid'] . "\\";

    // create execution directory if need
    if(file_exists($exec_path) === false) { mkdir($exec_path); }

    // check for php language
    if($lang === "php") {
        // save script to file
        save("app.php", "<?php\n" . $code . "\n?" . ">");
        // mark start time
        $time_a = microtime(true);
        // get response
        $data = curl("compilers/cache/" . $post['uuid'] . "/app.php");
        // mark end time
        $time_b = microtime(true);
        // print output
        json($data, 0, array("name" => "Back-End", "version" => ""));
    }

    // return if no compiler
    if(isset($lang_data) === false) { exit(); }

    // compiler path
    $comp_path = realpath('') . "\\binary\\" . $comp_name . "\\" .  $comp_data['path'];

    // return if no compiler binary
    if(file_exists($comp_path) === false) {
        json("Compiler does not exist at " . $comp_path,  0, $comp_data, true);
    }

    // method to replace name and extension
    function repl($text) {
        // get global lang data
        global $lang_data;
        // get global code
        global $code;
        // get keywords
        $keywords = $lang_data['keywords'];
        // for each keyword
        foreach($keywords as $key => $val) {
            // check for regexp
            if($val[0] === "/" && $val[strlen($val) - 1] === "/") {
                // match name expression
                preg_match($val, $code, $matches);
                // update file name if available
                if(isset($matches[1])) {
                    // replace with match
                    $text = str_replace("[". $key ."]", $matches[1], $text);
                }
            } else {
                // replace common text
                $text = str_replace("[". $key ."]", $val, $text);
            }
        }
        // retrun text
        return $text;
    }

    // source file name
    $file_name = repl("[name]");
    // source file extension
    $file_extn = repl("[extn]");
    // source file full name
    $full_name = $file_name . "." . $file_extn;

    // batch script for current block and jump to directory
    $bat_data = "@echo off\npath=" . $comp_path . "\ncd " . $exec_path . "\n";

    // all command lines
    $commands = $lang_data['commands'];

    // for each command line
    for($i = 0; $i < count($commands); $i++) {
        // check for last line
        if($i === count($commands) - 1) {
            // command to exit if any compile error
            $bat_data .= "if %errorlevel% neq 0 exit /b %errorlevel%\n";
        }
        // current line
        $bat_line = $commands[$i];
        // combine with batch script
        $bat_data .= repl($bat_line) . "\n";
    }

    // save source file
    save($full_name, $code);

    // save batch file
    save("run.bat", $bat_data);

    // mark start time
    $time_a = microtime(true);

    // run batch file to save output
    shell_exec($exec_path . "run.bat > " . $exec_path . "out.txt 2>&1");

    // mark end time
    $time_b = microtime(true);

    // output result
    $output = array("data" => read("out.txt"), "time" => $time_b - $time_a);

    // print output
    json(read("out.txt"), $time_b - $time_a, $comp_data);

?>