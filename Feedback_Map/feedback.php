<head><title>geoweb.m10 - Feedback</title></head>
<h2>Feedback-Formular</h2>

<form method="POST" action="feedback_send.php">
  <input name="pos" type="hidden" value="<?php echo $_GET['pos'];?> ">
  <input type="radio" name="geschlecht" value="Frau"/> Frau
  <input type="radio" name="geschlecht" value="Herr"/> Herr<br />
  <table>
    <tr><td>Name:</td>
       <td><input type="text" name="name" size="50" /></td>
    </tr>
    <tr><td>E-Mail: </td>
       <td><input type="text" name="email" size="50" /></td>
    </tr>
  </table>
  Feedback: <br />
  <textarea name="message" rows="10" cols="50"></textarea>
  <br />
  <input type="checkbox" name="team" checked="checked" value="ON" />
         Ich bin Mitglied des geoweb-Teams <br /><br />
  <input type="submit" value="Abschicken">
  <input type="reset" value="Zurücksetzen"> <br /><br />
  Ihr Feedback wird per E-Mail an die Autoren/innen zugestellt<br>
  und in der Projekt-Datenbank gespeichert.<br /><br />
  <br />
</form>

<p>geoweb.m10 (JB), Beispiel ausgehend von<br />
<a href="http://www.thesitewizard.com/archive/feedbackphp.shtml"
target="_blank"> PHP Tutorial: Feedback Form Script</a> </p>
