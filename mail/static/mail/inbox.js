document.addEventListener("DOMContentLoaded", function () {
  // Use buttons to toggle between views
  document
    .querySelector("#inbox")
    .addEventListener("click", () => load_mailbox("inbox"));
  document
    .querySelector("#sent")
    .addEventListener("click", () => load_mailbox("sent"));
  document
    .querySelector("#archived")
    .addEventListener("click", () => load_mailbox("archive"));
  document.querySelector("#compose").addEventListener("click", compose_email);

  // send the email when submit is clicked
  document
    .querySelector("#compose-form")
    .addEventListener("submit", send_email);

  // By default, load the inbox
  load_mailbox("inbox");
});

// function to send an email when submit button is clicked
// preventDefault is needed to stop the default behaviour of the submit button
function send_email(event) {
  event.preventDefault();

  // pick up the elements from the form
  const recepient = document.querySelector("#compose-recipients").value;
  const subject = document.querySelector("#compose-subject").value;
  const email_body = document.querySelector("#compose-body").value;

  // POST request of the created email
  fetch("/emails", {
    method: "POST",
    body: JSON.stringify({
      recipients: recepient,
      subject: subject,
      body: email_body,
    }),
  })
    .then((response) => response.json())
    .then((result) => {
      // Print result
      console.log(result);

      // load sent emails page
      load_mailbox("sent");
    });
}

function compose_email() {
  // Show compose view and hide other views
  document.querySelector("#emails-view").style.display = "none";
  document.querySelector("#compose-view").style.display = "block";

  // Clear out composition fields
  document.querySelector("#compose-recipients").value = "";
  document.querySelector("#compose-subject").value = "";
  document.querySelector("#compose-body").value = "";
}

function load_mailbox(mailbox) {
  // Show the mailbox and hide other views
  document.querySelector("#emails-view").style.display = "block";
  document.querySelector("#compose-view").style.display = "none";

  // Show the mailbox name
  document.querySelector("#emails-view").innerHTML = `<h3>${
    mailbox.charAt(0).toUpperCase() + mailbox.slice(1)
  }</h3>`;

  fetch(`/emails/${mailbox}`)
    .then((response) => response.json())
    .then((emails) => {
      // Print emails
      console.log(emails);

      // go through all the email
      emails.forEach((email_object) => {
        console.log(email_object);

        // create an HTML div tag for the email_ids
        const div_email_id = document.createElement("div");
        div_email_id.className = "list-emails";
        div_email_id.innerHTML = `
      <h5><strong>Time:</strong> ${email_object.timestamp}</h5>
      <h5><strong>Sender:</strong> ${email_object.sender}</h5>
      <h5><strong>To:</strong> ${email_object.recipients}</h5>
      <h5><strong>Subject:</strong> ${email_object.subject}</h5>
      <p>${email_object.body.substr(0, 20)}...</p>
      `;
        document.querySelector("#emails-view").append(div_email_id);
      });
    });
}
