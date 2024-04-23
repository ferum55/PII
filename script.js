const addButton = document.querySelector('.main-button-add');
const modal = document.getElementById('myModal');
const closeButton = document.querySelector('.close');
const addStudentForm = document.getElementById('addStudentForm');
const editButtons = document.querySelectorAll('.edit-button');
const removeButtons = document.querySelectorAll('.remove-button');
const removeStudentModal = document.getElementById('removeStudentModal');
const closeRemoveButton = document.querySelector('.close-remove');
const confirmRemoveButton = document.getElementById('confirmRemove');
const cancelRemoveButton = document.getElementById('cancelRemove');


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
                  <button class="edit-button">
                    <img src="pencil.png" width="20" alt="cross" />
                  </button>
                  <button class="remove-button">
                    <img src="X.png" width="20" alt="cross" />
                  </button>
                </td>`;

  const tableBody = document.querySelector(".main-table tbody");
  tableBody.appendChild(newRow);

  newRow.querySelector(".edit-button").addEventListener("click", handleEdit);
  newRow.querySelector(".remove-button").addEventListener("click", handleRemove);
  newRow.setAttribute('data-id', id);
}

let rowToRemove = null;


addButton.addEventListener('click', () => {
    document.getElementById('modal-content-title').textContent = 'Add Student';
    document.querySelector('#addStudentForm button[type="submit"]').textContent = 'Submit';
    modal.style.display = 'block';
});

closeButton.addEventListener('click', () => {
    resetModalAndForm();
});

editButtons.forEach(button => {
    button.addEventListener('click', handleEdit);
    
});

removeButtons.forEach(button => {
    button.addEventListener('click', handleRemove);
});

closeRemoveButton.addEventListener('click', () => {
    rowToRemove = null;
    removeStudentModal.style.display = 'none';
});

confirmRemoveButton.addEventListener('click', () => {
    if (rowToRemove !== null) {
        rowToRemove.remove(); 
        rowToRemove = null;
        removeStudentModal.style.display = 'none';
    }
});

cancelRemoveButton.addEventListener('click', () => {
    rowToRemove = null;
    removeStudentModal.style.display = 'none'; 
});

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
          addStudentForm.reset();
          modal.style.display = 'none';
        }
      }
    );
  }
});
/**
 * @param {string} requestUrl
 * @param {string} group - group field value
 * @param {string} firstName - firstName field value
 * @param {string} lastName - lastName field value
 * @param {string} gender - gender field value
 * @param {string} birthday - birthday field value
 * @param {function(string): void} actionAfterResponse - function,  which receives a response from the server as a parameter "responseText (string)" and performs actions on it
 * @returns {void}
*/


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
            } else {
                console.error('Error:', xhr.responseText);
            }
        }
    };

    xhr.send(JSON.stringify(data));
    console.log("POST add student request sent to:", requestUrl);
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

  }
function handleEdit(event) {
    const row = event.target.closest('tr');
    const cells = row.querySelectorAll('td');

    document.getElementById('group').value = cells[1].textContent;
    const nameSurname = cells[2].textContent.split(' ');
    document.getElementById('name').value = nameSurname[0];
    document.getElementById('surname').value = nameSurname[1];
    document.getElementById('gender').value = cells[3].textContent;
    document.getElementById('birthday').value = unformatBirthday(cells[4].textContent);
    
    
    document.getElementById('modal-content-title').textContent = 'Edit Student';

    
    document.querySelector('#addStudentForm button[type="submit"]').textContent = 'Save';

    row.classList.add('editing');
    modal.style.display = 'block';
}

function handleRemove(event) {
    const row = event.target.closest('tr');
    row.remove();
}

function formatBirthday(birthday) {
    const [year, month, day] = birthday.split('-');
    return `${day}.${month}.${year}`;
}

function unformatBirthday(birthday) {
    const [day, month, year] = birthday.split('.');
    return `${year}-${month}-${day}`;
}

function setupCheckboxEventListeners() {
    const checkboxes = document.querySelectorAll('.table-checkbox');

    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function () {
            const statusCell = this.parentNode.nextElementSibling.nextElementSibling.nextElementSibling.nextElementSibling.nextElementSibling;
            statusCell.style.color = this.checked ? 'green' : '#aaa';
        });
    });
}

setupCheckboxEventListeners();


function resetModalAndForm() {
    document.getElementById('group').value = ""; 
    document.getElementById('name').value = "";
    document.getElementById('surname').value = "";
    document.getElementById('gender').value = ""; 
    document.getElementById('birthday').value = "2004-09-05";
    document.getElementById('group').selectedIndex = 0;
    document.getElementById('gender').selectedIndex = 0;

    const editingRow = document.querySelector('.editing');
    if (editingRow) {
        editingRow.classList.remove('editing');
    }
    modal.style.display = 'none';
}

function handleRemove(event) {
    rowToRemove = event.target.closest('tr'); 
    removeStudentModal.style.display = 'block'; 
}