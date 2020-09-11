
// Budget controller
var budgetController = (function(){

    var Expense = function(id, des, val){
        this.id = id;
        this.des = des;
        this.val = val;
    }

    var Income = function(id, des, val){
        this.id = id;
        this.des = des;
        this.val = val;
    }

    var data = {
        allItems: {
            inc: [],
            exp: []
        },
        total: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: 0

    }

    var calculate = function(type){
        var sum = 0;
        
        data.allItems[type].forEach(function(current){
            sum += current.val;
        });
        data.total[type] = sum;
    };

    return {

        getDetails: function(type, des, val){

            var ID, newItem;
            ID = 0;
            if(data.allItems[type].length > 0) ID = data.allItems[type][data.allItems[type].length-1].id+1; 

            if(type === 'exp') newItem = new Expense(ID, des, val);
            else if(type === 'inc') newItem = new Income(ID, des, val);

            data.allItems[type].push(newItem);
            expensePercent = Math.round(data.total.exp / data.total.inc * 100);

            return {
                type: type,
                id: newItem.id,
                des: newItem.des,
                val: newItem.val,
            }
        },

        calculateBudget: function(){

            calculate('inc');
            calculate('exp');

            // calculate the budget
            data.budget = data.total.inc - data.total.exp;
            
            // get the expense percentage
            data.percentage = Math.round(data.total.exp / data.total.inc * 100);

            return {
                inc: data.total.inc,
                exp: data.total.exp,
                budget: data.budget,
                percentage: data.percentage
            }

        },

        getExpensePercentage: function(){
            var expPer = [];
            
            data.allItems.exp.forEach(function(current){
                if(data.total.inc === 0) expPer.push(-1);
                else expPer.push(Math.round(current.val / data.total.inc * 100));
            });
            
            return expPer;
        },

        deleteItemDetails: function(type, id){
            var idArr, index;

            idArr = data.allItems[type].map(function(current){
                return current.id;
            });

            index = idArr.indexOf(id);
            if(index !== -1) data.allItems[type].splice(index, 1);

        }

    };
})();


// User Interface Controller
var UIController = (function(){

    // All the required DOM manipulation Strings
    var DOMStrings = {
        month: '.budget__title--month',
        budgetValue: '.budget__value',
        budgetIncomeValue: '.budget__income--value',
        budgetExpenseValue: '.budget__expenses--value',
        budgetExpensePercentage: '.budget__expenses--percentage',
        inputType: '.add__type',
        intputDescription: '.add__description',
        inputValue: '.add__value',
        addValue: '.add__btn',
        incomeList: '.income__list',
        expenseList: '.expenses__list',
        expensePercent: '.item__percentage',
        container: '.container'
    }

    // clear and set fields to default value
    clearAll = document.querySelectorAll(DOMStrings.budgetValue + ', ' + DOMStrings.budgetIncomeValue + ', ' + DOMStrings.budgetExpenseValue);
    clear = Array.prototype.slice.call(clearAll);
    clear.forEach(function(cur){
        cur.textContent = '0.00';
    });
    document.querySelector(DOMStrings.budgetExpensePercentage).textContent = '---';

    var format = function(num, type){

        num = Math.abs(num);
        num = num.toFixed(2);
        num = num.split('.');
        int = num[0];
        dec = num[1];
        if(int.length > 3){
            int = int.substr(0, int.length-3) + ',' + int.substr(int.length-3, 3);
        }

        return (type === 'inc'? '+':'-') + int + '.' + dec;

    };

    return{

        domStrings: DOMStrings,

        displayMonth: function(){
            var date = new Date;
            var month = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            document.querySelector(DOMStrings.month).textContent = month[date.getMonth()] + ',' + date.getFullYear();
        },

        getInput: function(){
            return{
                type: document.querySelector(DOMStrings.inputType).value,
                description: document.querySelector(DOMStrings.intputDescription).value,
                value: parseFloat(document.querySelector(DOMStrings.inputValue).value)
            }
        },

        clearFields: function(){
            var fields, fieldsarr;

            fields = document.querySelectorAll(DOMStrings.intputDescription + ', ' + DOMStrings.inputValue);
            fieldarr = Array.prototype.slice.call(fields);
            fieldarr.forEach(function(current, index, array){
                current.value = '';
            });

            document.querySelector(DOMStrings.intputDescription).focus();
        },

        setBudget: function(budget){

            if(budget.inc === 0) document.querySelector(DOMStrings.budgetIncomeValue).textContent = format(0, 'inc');
            if(budget.exp === 0) document.querySelector(DOMStrings.budgetExpenseValue).textContent = format(0, 'exp');

            if(budget.budget >= 0) document.querySelector(DOMStrings.budgetValue).textContent = format(budget.budget, 'inc');
            else document.querySelector(DOMStrings.budgetValue).textContent = format(budget.budget, 'exp');
            if(budget.inc !== 0) document.querySelector(DOMStrings.budgetIncomeValue).textContent = format(budget.inc, 'inc');
            if(budget.exp !== 0) document.querySelector(DOMStrings.budgetExpenseValue).textContent = format(budget.exp, 'exp');
            if(budget.exp !== 0 && budget.inc !== 0) document.querySelector(DOMStrings.budgetExpensePercentage).textContent = budget.percentage + '%';
            if(budget.inc === 0 || budget.exp === 0) document.querySelector(DOMStrings.budgetExpensePercentage).textContent = '---';

        },

        addDetails: function(item){

            var element, html, newHtml;

            // set html to the required template
            if(item.type === 'inc'){
                element = DOMStrings.incomeList;
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button> </div></div></div>';
            }else if(item.type === 'exp'){
                element = DOMStrings.expenseList;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div> <div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }

            newHtml = html.replace('%id%', item.id);
            newHtml = newHtml.replace('%description%', item.des);
            newHtml = newHtml.replace('%value%', format(item.val, item.type));

            // add it to the display
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);

        },

        setExpensePercentage: function(expPer){
            
            var fields = document.querySelectorAll(DOMStrings.expensePercent);

            var nodeListForEach = function(list, callBack){
                for(var i = 0; i < list.length; i++) callBack(list[i], i);
            };

            nodeListForEach(fields, function(current, index){

                if(expPer[index] >= 0) current.textContent = expPer[index] + '%';
                else current.textContent = '---';

            });

        },

        deleteEntry: function(id){

            var element = document.getElementById(id);
            element.parentNode.removeChild(element);

        },

        changeType: function(){

            document.querySelector(DOMStrings.inputType).classList.toggle('red-focus');
            document.querySelector(DOMStrings.inputValue).classList.toggle('red-focus');
            document.querySelector(DOMStrings.intputDescription).classList.toggle('red-focus');

            document.querySelector(DOMStrings.addValue).classList.toggle('red');

        }

    };
})();


// App controller
var controller  = (function(bCtrl, uCtrl){

    var DOMStrings = uCtrl.domStrings;

    var  actionListner = function(){

        document.querySelector(DOMStrings.addValue).addEventListener('click', addDetails);

        document.addEventListener('keypress', function(event){
            if(event.keyCode === 13 || event.which === 13) addDetails();
        });

        document.querySelector(DOMStrings.container).addEventListener('click', deleteItem);

        document.querySelector(DOMStrings.inputType).addEventListener('change', uCtrl.changeType);
    }

    var updateBudget = function(){

        // calculate the budget
        var budget = bCtrl.calculateBudget();
        
        // display in UI
        uCtrl.setBudget(budget);

        // update the expense percentage
        var expPer = bCtrl.getExpensePercentage();
    
        // display in UI
        uCtrl.setExpensePercentage(expPer);

    };

    var addDetails = function(){

        // get the input Details
        var details = uCtrl.getInput();

        if(details.description !== '' && !isNaN(details.value) && details.value > 0){
            // add them to Budget Controller
            var newItem = bCtrl.getDetails(details.type, details.description, details.value);

            // display in the respective type
            uCtrl.addDetails(newItem);

            // clear the fields
            uCtrl.clearFields();

            // update the Budget
            updateBudget();
        }

    };

    var deleteItem = function(event){
        var itemID, id, splitID, type;

        // get id of the parent node
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        
        splitID = itemID.split('-');
        type = splitID[0];
        id = splitID[1];

        if(type === 'inc' || type === 'exp'){

            // delete from the budget
            bCtrl.deleteItemDetails(type, parseInt(id));

            // delete from the UI
            uCtrl.deleteEntry(itemID);

            // disply the new budget
            updateBudget();
        
        }

    };

    return {

        init: function(){
            actionListner();
            uCtrl.displayMonth();
        }

    };
})(budgetController, UIController);


controller.init();
