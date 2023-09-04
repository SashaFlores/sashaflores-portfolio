<?php

error_reporting(E_ALL);
ini_set('display_errors', 1);

use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;
require_once 'PHPMailer/PHPMailer.php';
require_once 'PHPMailer/Exception.php';
require_once 'PHPMailer/SMTP.php';


if (isset($_POST['email'])) {
  $name = $_POST['name'];
  $email = $_POST['email'];
  $message = $_POST['message'];

  // Set your email address where you want to receive emails. 
  $to = 'sashaflores207@gmail.com';
  $subject = 'Contact Request From sasha flores';
  $headers = "From: ".$name." <".$email."> \r\n";

  $mail = new PHPMailer();
  $mail->IsSMTP();
  $mail->Mailer = "smtp";
  $mail->SMTPDebug  = 0;  
  $mail->SMTPAuth   = TRUE;
  $mail->SMTPSecure = "tls";
  $mail->Port       = "587";
  $mail->Host       = "smtp.gmail.com";
  $mail->Username   = "sashaflores207@gmail.com";
  $mail->Password   = "exforcsvtstjguab";
  $mail->IsHTML(true);
  $mail->AddAddress("sashaflores207@gmail.com", "Sasha Flores");
  $mail->SetFrom("sashaflores207@gmail.com", "Sasha Flores");
  $mail->Subject = "New Message from:" . $name;
  $content = "Name: $name <br>Email: $email <br>Message: $message";

  $mail->MsgHTML($content); 
if(!$mail->Send()) {
  echo "Mailer Error: " . $mail->ErrorInfo;

} else {
  echo "Message Sent! Thanks for contacting me.";
}

}
?>