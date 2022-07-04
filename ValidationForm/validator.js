//Đối tượng `Validator`
function Validator(options) {

    function getParent(element, selector) {
        while (element.parentElement) {
            if(element.parentElement.matches(selector)) {
                return element.parentElement;
            } 
            element = element.parentElement;
        }
    }


    var selectorRules = {};

//hàm thực hiện validate
   function validate(inputElement, rule) {
    var errorElement = getParent(inputElement, options.formGroupSelector).querySelector(options.errorSelector);
    var errorMessage;

    //lấy ra các rules của selector
    var rules = selectorRules[rule.selector];

    //lặp qua từng rule và kiểm tra - nếu có lỗi thì dừng việc kiểm tra
    for (var i = 0; i < rules.length; ++i) {
        switch (inputElement.type) {
            case 'radio':
            case 'checkbox':
                errorMessage = rules[i](
                    formElement.querySelector(rule.selector + ':checked')
                );
                break;
            default: 
                errorMessage = rules[i](inputElement.value);
    }

    if(errorMessage) break;
    
}
    if (errorMessage) {
        errorElement.innerText = errorMessage;
        getParent(inputElement, options.formGroupSelector).classList.add('invalid');
    } else {
        errorElement.innerText = '';
        getParent(inputElement, options.formGroupSelector).classList.remove('invalid');
    }
    return !errorMessage;
   }
   //lấy element của form cần validate
   var formElement = document.querySelector(options.form);
   
   if (formElement) {
        //khi submit form
        formElement.onsubmit = function (e) {
            e.preventDefault();

            var isFormValid = true;

            //lặp qua từng rules và validate    
        options.rules.forEach(function (rule) {
            var inputElement = formElement.querySelector(rule.selector);
            var isValid = validate(inputElement, rule);

            if(!isValid) {
                isFormValid = false;
            }

        });

            if(isFormValid) {
                //Trường hợp submit với javascript
               if(typeof options.onSubmit === 'function') {
                var enableInputs  = formElement.querySelectorAll('[name]');
                var formValues = Array.from(enableInputs).reduce(function (values, input) {
                    values[input.name] = input.value
                    return values;
                }, {});
                options.onSubmit(formValues);
               } 
               //trường hợp submit với hành vi mặc định
               else {
                    formElement.submit();
               }
            }
        
        }
        //lặp qua mỗi rule và xử lý (lắng nghe sự kiện blur, input,...)
        options.rules.forEach(function (rule) {

            //Lưu lại các rules cho mỗi input

            if (Array.isArray(selectorRules[rule.selector])) {
                selectorRules[rule.selector].push(rule.test);
            } else {
                selectorRules[rule.selector] = [rule.test];
            }

            var inputElements = formElement.querySelectorAll(rule.selector);

            Array.from(inputElements).forEach(function (inputElement) {
                            //Xử lý trường hợp blur ra khỏi input
            inputElement.onblur = function () {
                validate(inputElement, rule);
            }

            //Xử lý mỗi khi người dùng nhập input
            inputElement.oninput = function() {
                var errorElement = getParent(inputElement, options.formGroupSelector).querySelector('.form-message');
                errorElement.innerText = '';
                 getParent(inputElement, options.formGroupSelector).classList.remove('invalid');
            }
            });

    });
}
}

//Định nghĩa rules
Validator.isRequired = function (selector, message) {
    return {
        selector: selector,
        test: function (value) {
            return value ? undefined : message || 'Vui lòng nhập trường này'
        }
    };
}

Validator.isEmail = function (selector, message) {
    return {
        selector: selector,
        test: function (value) {
            var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
            return regex.test(value) ? undefined : message || 'Trường này phải là email'
        }
    };
}

Validator.minLength = function (selector, min, message) {
    return {
        selector: selector,
        test: function (value) {
            return value.length >= min ? undefined : message || `Vui lòng nhập tối thiểu ${min} kí tự`
        }
    };
}

Validator.isConfirmed = function (selector, getConfirmValue, message) {
    return {
        selector: selector,
        test: function (value) {
            return value === getConfirmValue() ? undefined : message || 'Giá trị nhập vào không chính xác';
        }
    }
}
