<?php

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

    // return if no compiler
    if(isset($lang_data) === false) { exit(); }

    // compiler path
    $comp_path = realpath('') . "\\binary\\" . $comp_name . "\\" .  $comp_data['path'];
    // execution path
    $exec_path = "cache\\" . $post['uuid'] . "\\";

    // create execution directory if need
    if(file_exists($exec_path) === false) { mkdir($exec_path); }

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

    // source file name
    $file_name = "app";
    // source file extension
    $file_extn = $lang_data["extn"];

    // if file name pattern
    if(isset($lang_data['file'])) {
        // match name expression
        preg_match($lang_data['file'], $code, $matches);
        // update file name if available
        if(isset($matches[1])) { $file_name = $matches[1]; }
    }

    // source file full name
    $full_name = $file_name . "." . $file_extn;

    // method to replace name and extension
    function repl($text) {
        // get global file name
        global $file_name;
        // get global file extension
        global $file_extn;
        // replace file name
        $text = str_replace("[name]", $file_name, $text);
        // replace file extension
        $text = str_replace("[extn]", $file_extn, $text);
        // retrun text
        return $text;
    }

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

    // print output and compiler data
    echo json_encode(array("output" => $output, "compiler" => $comp_data));

?>