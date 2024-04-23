using System;
using System.ComponentModel.DataAnnotations;
using System.Reflection;
using static System.Runtime.InteropServices.JavaScript.JSType;

namespace UCD_Server.Models
{
	public record Student 
	{
        private static int _idCounter = 0;
        public int? Id { get; init; }
        public string? Group { get; set; }
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public string? Gender { get; set; }
        public string? Birthday { get; set; }
        public bool? IsActive { get; set; }

        public Student()
        {
            Id = -1;
            Group = "undefined group";
            FirstName = "undefined first name";
            LastName = "undefined last name";
            Gender = "undefined gender";
            Birthday = "undefined birthday";
     
        }

        public Student(string? group, string? firstName, string? lastName, string? gender, string? birthday)
        {
            var validationResult = GetErrorsArrayForInvalidFieldsOrNullsOtherwise(firstName, lastName, birthday);
            if (validationResult.Any(res => res is not null))
            {
                throw new ArgumentException(string.Join("&&", validationResult));
            }

            Id = ++_idCounter;

            Group = group;
            FirstName = firstName;
            LastName = lastName;
            Gender = gender;
            Birthday = birthday;
            IsActive = false;
        }

        public static string?[] GetErrorsArrayForInvalidFieldsOrNullsOtherwise(string? firstName, string? lastName, string? birthday)
        {
            string? firstNameValidationResult = ValidateNameAndSurname(firstName);
            string? lastNameValidationResult = ValidateNameAndSurname(lastName);
            string? birthdayValidationResult = ValidateBirthday(birthday);

            return new string?[]
            {
                firstNameValidationResult,
                lastNameValidationResult,
                birthdayValidationResult
            };
        }

        private static string? ValidateNameAndSurname(string? firstName)
        {
            if (string.IsNullOrEmpty(firstName) || firstName.Length < 3 || firstName.Length > 20 || !System.Text.RegularExpressions.Regex.IsMatch(firstName, @"^[a-zA-Z]*$"))
                return "Invalid input. This field can only contain letters a-z (A-Z) and must have length between 3 and 20.";
            else
                return null;
        }

        private static string? ValidateBirthday(string? birthday)
        {
            if (string.IsNullOrEmpty(birthday))
                return "This field cannot be empty";

            var splitedBirthday = birthday.Split('-');
            if (splitedBirthday is not null)
            {
                if (!int.TryParse(splitedBirthday[0], out int year) ||
                    !int.TryParse(splitedBirthday[1], out int month) ||
                    !int.TryParse(splitedBirthday[2], out int day))
                {
                    return "Invalid birthday format. Please use YYYY-MM-DD";
                }

                var possibleBirthday = new DateTime(year, month, day);

                // Перевірка дати в майбутньому
                if (possibleBirthday > DateTime.Now)
                    return "This field cannot contain a date in the future";

                // Перевірка віку (старше 18 років)
                var today = DateTime.Today;
                var age = today.Year - possibleBirthday.Year;

                // Перевірка дня народження, який припадає на сьогоднішню дату
                if (possibleBirthday.Month > today.Month ||
                    (possibleBirthday.Month == today.Month && possibleBirthday.Day > today.Day))
                {
                    age--;
                }

                if (age < 18)
                    return "User must be at least 18 years old";
            }

            return null;
        }


        public static void SetLastAddedStudentId(int? lastId)
        {
            _idCounter = lastId is null ? 0 : (int)lastId;
        }
    }
}

