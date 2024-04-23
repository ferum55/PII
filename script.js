const addButton = document.querySelector(".main-button-add");
const modal = document.getElementById("myModal");
const closeButton = document.querySelector("#myModal .close");

const addStudentForm = document.getElementById("addStudentForm");
const editButtons = document.querySelectorAll(".edit-button");
const removeButtons = document.querySelectorAll(".remove-button");

let rowToRemove = null;
const UCD_SERVER_URL = "https://localhost:7179/";

window.addEventListener('load', function(event) 
{
    getAllStudentServerRequest
    (
        UCD_SERVER_URL + 'Students/GetAllStudents', 
        function(responseText)
        {
            let responseObject = JSON.parse(responseText);

            if(responseObject.Status === true)
            {
                let allStudentsArray = responseObject.Object;
                allStudentsArray.forEach(student => {
                    addNewStudentsTableRow(
                        student.Id, 
                        student.Group, 
                        student.FirstName + ' ' + student.LastName, 
                        student.Gender, 
                        formatBirthday(student.Birthday)
                    );
                });

            }
        }
    );
});

function addNewStudentsTableRow(id, group, name, gender, birthday)
{
  const newRow = document.createElement("tr");
  newRow.innerHTML = `
            <td><input type="checkbox" class="table-checkbox"/></td>
            <td>${group}</td>
            <td>${name}</td>
            <td>${gender}</td>
            <td>${(birthday)}</td> 
            <td class="table-status"><span class="circle"></span></td>
                <td>
                <button class="edit-button" aria-label="Edit Student"><img src="pencil.png" width="20px"></button>
                <button class="remove-button" aria-label="Remove Student"><img src="X.png" width="20px"></button>
                </td>`;

  const tableBody = document.querySelector(".main-table tbody");
  tableBody.appendChild(newRow);

  newRow.querySelector(".edit-button").addEventListener("click", handleEdit);
  newRow.querySelector(".remove-button").addEventListener("click", handleRemove);
  newRow.setAttribute('data-id', id);
}


addButton.addEventListener("click", () => {
  document.getElementById("modal-content-title").textContent = "Add Student";

  document.querySelector('#addStudentForm button[type="submit"]').textContent = "Submit";
  modal.style.display = "block";
});

closeButton.addEventListener("click", () => {
  resetModalAndForm();
});

editButtons.forEach((button) => 
{
  button.addEventListener("click", handleEdit);
});

function handleEdit(event) {
  const row = event.target.closest("tr");
  const cells = row.querySelectorAll("td");

  document.getElementById("group").value = cells[1].textContent;
  const nameSurname = cells[2].textContent.split(" ");
  document.getElementById("name").value = nameSurname[0];
  document.getElementById("surname").value = nameSurname[1];
  document.getElementById("gender").value = cells[3].textContent;
  document.getElementById("birthday").value = unformatBirthday(cells[4].textContent);

  document.getElementById("modal-content-title").textContent = "Edit Student";

  document.querySelector('#addStudentForm button[type="submit"]').textContent =
    "Save";

  row.classList.add("editing");
  modal.style.display = "block";
}


removeButtons.forEach((button) => 
{
  button.addEventListener("click", handleRemove);
});
  
function handleRemove(event) 
{
  const row = event.target.closest("tr");
  row.remove();
  
  const studentId = row.getAttribute('data-id'); // Отримання ID студента

  deleteStudentServerRequest(
    UCD_SERVER_URL + 'Students/DeleteStudent', 
    studentId, 
    function(responseText)
    {
      let responseObject = JSON.parse(responseText);

      if(responseObject.Status === true)
        row.remove();
    }) 
}


function formatBirthday(birthday) {
  const [year, month, day] = birthday.split("-");
  return `${day}.${month}.${year}`;
}

function unformatBirthday(birthday) {
  const [day, month, year] = birthday.split(".");
  return `${year}-${month}-${day}`;
}

function resetModalAndForm() {
  document.getElementById("group").value = "";
  document.getElementById("name").value = "";
  document.getElementById("surname").value = "";
  document.getElementById("gender").value = "";
  document.getElementById("birthday").value = "2005-08-01";

  document.getElementById("group").selectedIndex = 0;
  document.getElementById("gender").selectedIndex = 0;

  const editingRow = document.querySelector(".editing");
  if (editingRow) {
    editingRow.classList.remove("editing");
  }

  modal.style.display = "none";
}




//Кружечки
document.addEventListener("DOMContentLoaded", function () {
  const table = document.getElementById("table");
  const checkboxHead = table.querySelector(".checkbox-head");

  checkboxHead.addEventListener("change", function (event) {
    const isChecked = event.target.checked;
    const checkboxes = table.querySelectorAll(".table-checkbox");

    checkboxes.forEach(function (checkbox) {
      checkbox.checked = isChecked;
      const circle = checkbox.closest("tr").querySelector(".circle");
      if (circle) {
        circle.style.backgroundColor = isChecked ? "green" : "#8c8c8c";
      }
    });
  });

  table.addEventListener("change", function (event) {
    if (event.target.classList.contains("table-checkbox")) {
      const isChecked = event.target.checked;
      const circle = event.target.closest("tr").querySelector(".circle");
      if (circle) {
        circle.style.backgroundColor = isChecked ? "green" : "#8c8c8c";
      }
    }
  });
});

function clearFormValidation() {
  const fields = document.querySelectorAll(
    "#myModalAdd .modal-body .form-control");
  fields.forEach((field) => {
    field.classList.remove("is-invalid");
  });
}

addStudentForm.addEventListener('submit', (event) => {
  event.preventDefault();

  const group = document.getElementById('group').value;
  const name = document.getElementById('name').value;
  const surname = document.getElementById('surname').value;
  const gender = document.getElementById('gender').value;
  const birthday = document.getElementById('birthday').value;

  const editingRow = document.querySelector('.editing');
  if (editingRow) {
    editStudentServerRequest(
      UCD_SERVER_URL + 'Students/EditStudent',
      editingRow.getAttribute('data-id'),
      group,
      name,
      surname,
      gender,
      birthday,
      (responseText) => {
        let responseObject = JSON.parse(responseText);

        if (responseObject.Status === false) {
          Toastify({
            text: "Name and surname must contain only letters",
            duration: 2000,
            className: "info",
            style: {
              background: "red",
            },
          }).showToast();
        } else {
          editingRow.cells[1].textContent = group;
          editingRow.cells[2].textContent = `${name} ${surname}`;
          editingRow.cells[3].textContent = gender;
          editingRow.cells[4].textContent = formatBirthday(birthday);
          editingRow.classList.remove('editing');

          clearFormValidation();
          addStudentForm.reset();
          modal.style.display = 'none';
        }
      }
    );
  } else {
    addNewStudentServerRequest(
      UCD_SERVER_URL + 'Students/AddStudent',
      group,
      name,
      surname,
      gender,
      birthday,
      (responseText) => {
        let responseObject = JSON.parse(responseText);

        if (responseObject.Status === false) {
          Toastify({
            text: "Name and surname must contain only letters",
            duration: 2000,
            className: "info",
            style: {
              background: "red",
            },
          }).showToast();
        } 
        else {
          addNewStudentsTableRow(responseObject.Object.Id, responseObject.Object.Group, responseObject.Object.FirstName + ' ' + responseObject.Object.LastName, responseObject.Object.Gender, formatBirthday(responseObject.Object.Birthday));
          clearFormValidation
          addStudentForm.reset();
          modal.style.display = 'none';
        }
      }
    );
  }
});

// Server Requests
function addNewStudentServerRequest(requestUrl, group, firstName, lastName, gender, birthday, actionAfterResponse)
{
    const data = {
        Group: group,
        FirstName: firstName,
        LastName: lastName,
        Gender: gender,
        Birthday: birthday
    };
    console.log("POST request data: \n\n", data);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", requestUrl, true);
    xhr.setRequestHeader("Content-Type", "application/json");

    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                console.log('Success.\n\nResponse text:\n\n', xhr.responseText);
                actionAfterResponse(xhr.responseText);
            } else
                console.error('Error:', xhr.responseText);
        }
    };

    xhr.send(JSON.stringify(data));
    console.log("POST add student request sent to:", requestUrl);
}
function editStudentServerRequest(requestUrl, id, group, firstName, lastName, gender, birthday, actionAfterResponse)
{
    const data = {
        Id: id,
        Group: group,
        FirstName: firstName,
        LastName: lastName,
        Gender: gender,
        Birthday: birthday
    };
    console.log("POST request data: \n\n", data);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", requestUrl, true);
    xhr.setRequestHeader("Content-Type", "application/json");

    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                console.log('Success.\n\nResponse text:\n\n', xhr.responseText);
                actionAfterResponse(xhr.responseText);
            } else {
                console.error('Error:', xhr.responseText);
            }
        }
    };

    xhr.send(JSON.stringify(data));
    console.log("POST edit student request sent to:", requestUrl);
}

function getAllStudentServerRequest(requestUrl, actionAfterResponse)
{
    const xhr = new XMLHttpRequest();
    xhr.open("GET", requestUrl, true);

    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                console.log('Success.\n\nResponse text:\n\n', xhr.responseText);
                actionAfterResponse(xhr.responseText);
            } else {
                console.error('Error:', xhr.responseText);
            }
        }
    };

    xhr.send();
    console.log("GET all student request sent to:", requestUrl);
}

function deleteStudentServerRequest(requestUrl, studentId,  actionAfterResponse)
{
    const xhr = new XMLHttpRequest();
    const url = `${requestUrl}/${studentId}`; // Додаємо studentId до URL-адреси

    xhr.open("DELETE", url, true);

    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                console.log('Success.\n\nResponse text:\n\n', xhr.responseText);
                actionAfterResponse(xhr.responseText);
            } else {
                console.error('Error:', xhr.responseText);
            }
        }
    };

    xhr.send();

    console.log("DELETE student request sent to:", url);
}
