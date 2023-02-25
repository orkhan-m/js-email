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

      // load sent emails page
      load_mailbox("sent");
    });
}

function compose_email() {
  // Show compose view and hide other views
  document.querySelector("#emails-view").style.display = "none";
  document.querySelector("#compose-view").style.display = "block";
  document.querySelector("#email-individual-view").style.display = "none";

  // Clear out composition fields
  document.querySelector("#compose-recipients").value = "";
  document.querySelector("#compose-subject").value = "";
  document.querySelector("#compose-body").value = "";
}

function load_mailbox(mailbox) {
  // Show the mailbox and hide other views
  document.querySelector("#emails-view").style.display = "block";
  document.querySelector("#compose-view").style.display = "none";
  document.querySelector("#email-individual-view").style.display = "none";

  // Show the mailbox name
  document.querySelector("#emails-view").innerHTML = `<h3>${
    mailbox.charAt(0).toUpperCase() + mailbox.slice(1)
  }</h3>`;

  fetch(`/emails/${mailbox}`)
    .then((response) => response.json())
    .then((emails) => {
      // go through all the email
      emails.forEach((email_object) => {
        // create an HTML div tag for the email_ids
        const div_email_id = document.createElement("div");
        div_email_id.classList.add("list-emails");
        div_email_id.innerHTML = `
      <h5><strong>Sender:</strong> ${email_object.sender}</h5>
      <h5><strong>To:</strong> ${email_object.recipients}</h5>
      <h5><strong>Subject:</strong> ${email_object.subject}</h5>
      <p>${email_object.body.substr(0, 20)}...</p>
      <p><strong>Time:</strong> ${email_object.timestamp}</p>
      `;
        // If the email is read add class "read" if otherwise add class "unread"
        div_email_id.classList.add(email_object.read ? "read" : "unread");
        // Add click event to email
        div_email_id.addEventListener("click", function () {
          read_email(email_object.id);
        });

        // append new div to the "emails-view" class
        document.querySelector("#emails-view").append(div_email_id);
      });
    });
}

function read_email(email_id) {
  fetch(`/emails/${email_id}`)
    .then((response) => response.json())
    .then((email) => {
      // open new page with email_object
      const sender = email.sender;
      const time = email.timestamp;
      const body = email.body;
      const subject = email.subject;
      const recepients = email.recepients;

      // Show compose view and hide other views
      document.querySelector("#emails-view").style.display = "none";
      document.querySelector("#compose-view").style.display = "none";
      document.querySelector("#email-individual-view").style.display = "block";

      document.querySelector(
        "#email-individual-view"
      ).innerHTML = `<h4><strong>Time:</strong> ${time}</h4>
      <h4><strong>Sender:</strong> ${sender}</h4>
      <h4><strong>To:</strong> ${recepients}</h4>
      <h4><strong>Subject:</strong> ${subject}</h4>
      <p>${body}</p>
      `;

      fetch(`/emails/${email_id}`, {
        method: "PUT",
        body: JSON.stringify({
          read: true,
        }),
      });

      //
      const buttonArchive = document.createElement("button");
      buttonArchive.innerHTML = email.archived ? "Unarchive" : "Archive";
      buttonArchive.className = email.archived
        ? "btn btn-success"
        : "btn btn-danger";

      buttonArchive.addEventListener("click", function () {
        fetch(`/emails/${email_id}`, {
          method: "PUT",
          body: JSON.stringify({
            archived: !email.archived,
          }),
        }).then(() => {
          load_mailbox("archive");
        });
      });
      document.querySelector("#email-individual-view").append(buttonArchive);

      const buttonReply = document.createElement("button");
      buttonReply.innerHTML = "Reply";
      buttonReply.className = "btn btn-primary";
      buttonReply.addEventListener("click", function () {
        compose_email();

        document.querySelector("#compose-recipients").value = sender;

        if (!subject.startsWith("Re: ")) {
          document.querySelector("#compose-subject").value = "Re: " + subject;
        } else {
          document.querySelector("#compose-subject").value = subject;
        }

        document.querySelector(
          "#compose-body"
        ).value = `On ${time} ${sender} wrote: ${body}`;
      });

      document.querySelector("#email-individual-view").append(buttonReply);
    });
}
