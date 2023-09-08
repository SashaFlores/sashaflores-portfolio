<?php

error_reporting(E_ALL);
ini_set('display_errors', 1);

use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;
require_once 'PHPMailer.php';
require_once 'Exception.php';
require_once 'SMTP.php';


if (isset($_POST['email'])) {
  $name = $_POST['name'];
  $email = $_POST['email'];
  $message = $_POST['message'];

  // Set your email address where you want to receive emails. 
  $to = 'request@sashaflores.xyz';
  $subject = 'Contact Request From sasha flores';
  $headers = "From: ".$name." <".$email."> \r\n";

  $mail = new PHPMailer();
  $mail->IsSMTP();
  $mail->Mailer = "smtp";
  $mail->SMTPDebug  = 2;  
  $mail->SMTPAuth   = TRUE;
  $mail->SMTPSecure = "ssl";
  $mail->Port       = 465;                                                // gmail: 587
  $mail->Host       = "sashaflores.xyz";
  $mail->Username   = "request@sashaflores.xyz";
  $mail->Password   = "Kosomak@100";                                                   // gmail: exforcsvtstjguab
  $mail->IsHTML(true);
  $mail->AddAddress("request@sashaflores.xyz", "Sasha Flores");
  $mail->SetFrom("request@sashaflores.xyz", "Sasha Flores");
  $mail->Subject = "New Message from:" . $name;
  $content = "Name: $name <br>Email: $email <br>Message: $message";

  $mail->MsgHTML($content); 
if(!$mail->Send()) {
  echo "Error while sending Email: " . $mail->ErrorInfo;

} else {
  echo "Message Sent! Thanks for contacting me.";
}

}
?>