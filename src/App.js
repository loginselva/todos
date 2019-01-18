import React, { Component } from 'react';
import './App.css';
import axios from "axios";

class App extends Component {
  state = {
    checkedList: [],
    todolist: [],
    inputValue: '',
    validationMsg: [],
    itemLeftCount: 0,
    todoListData: []
  }

  componentDidMount() {
    this.getDataFromDb();
  }

  handleClick = (e) => {
    let checkedItem = this.state.checkedList;
    //check the item is already checked or not
    let index = checkedItem.indexOf(e.list);
    if (index > -1) {
      checkedItem.splice(index, 1)
      this.updateDB(e.list, 0);
    } else {
      checkedItem.push(e.list);
      this.updateDB(e.list, 1);
    }
    this.setState({ checkedList: checkedItem })
    this.itemCount()
  }

  handleClose = (e) => {
    let listItem = this.state.todolist;
    let checkedItem = this.state.checkedList;
    let index = listItem.indexOf(e.list);
    listItem.splice(index, 1)
    this.deleteFromDB(e.list);

    let checkedIndex = checkedItem.indexOf(e.list);
    if (checkedItem.length > 0 && checkedIndex > -1) {
      checkedItem.splice(index, 1)
      this.setState({ checkedList: checkedItem })
    }

    this.setState({ todolist: listItem })
    this.itemCount()
  }

  handleChange = (event) => {
    this.setState({ inputValue: event.target.value })
  }

  formSubmit = (e) => {
    let newTodo = this.state.inputValue.trim();
    let listItem = this.state.todolist;
    let validationMsg = [];
    if (newTodo.length >= 100) {
      validationMsg.push('Max 100 characters');
    }
    let regex = new RegExp("^[a-zA-Z0-9-_]+$");
    if (!regex.test(newTodo)) {
      validationMsg.push('Allowed chars a-z, A-Z, 0-9, -,_');
    }
    
    if (newTodo != '' && validationMsg.length == 0) {
      listItem.push(newTodo)
      this.putDataToDB(newTodo)
      this.setState({ todolist: listItem, inputValue: '', validationMsg });
    } else {
      this.setState({ validationMsg})
    }
    e.preventDefault();
  }

  itemCount = () => { 
    let { todolist, checkedList } = this.state;
    let itemLeft = todolist.length - checkedList.length
    this.setState({ itemLeftCount: itemLeft})
  }

  // fetch data from our data base
  getDataFromDb = () => {
    let itemList = [];
    let checkList = [];
    fetch("/api/getData")
      .then(data => data.json())
      .then(res => { 
        if (res && res.data){
          let checkedItem = res.data.filter(ret => ret.isChecked >0 );
          if (checkedItem.length > 0) {
            checkedItem.map(ret => checkList.push(ret.item)) 
          }
          res.data.map(ret => itemList.push(ret.item) )
          this.setState({ todolist: itemList, checkedList: checkList })
          this.itemCount()
        } 
      });
  };

  putDataToDB = (item) => {
    axios.post("/api/putData", {
      item: item
    });
  };

  deleteFromDB = item => {
    axios.delete("/api/deleteData", {
      data: {
        item: item
      }
    });
  };

  updateDB = (itemToUpdate, updateToApply) => {
    axios.post("/api/updateData", {
      item: { item: itemToUpdate },
      update: { isChecked: updateToApply }
    });
  };


  render() {
    let { todolist, checkedList, inputValue, validationMsg, itemLeftCount } = this.state;
    return (
      <div className="App">
        <div className="inputBox" >
          <form className="addTodoForm" onSubmit={this.formSubmit}>
            <input type="text" className="myInput" placeholder="Add New ToDo..." value={inputValue} onChange={(event) => this.handleChange(event)} />
          </form>
          {validationMsg}
        </div> 
        <ul id="myUL">
          {
            todolist.map(list => {
              let selected = checkedList.includes(list) ? 'checked' : '';
              return <li key={list} className={selected} >
                <span onClick={() => this.handleClick({ list })} >{list}</span>
                <span className="close" onClick={() => this.handleClose({ list })} >×</span>
              </li>
            })
          }
          <li> {itemLeftCount} items left</li>
        </ul>
         

      </div>
    );
  }
}

export default App;
