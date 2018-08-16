import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import { allBooks } from './books.js';

function AppBackground(props) {
    return(
      <div className="app-background">
        <App />
      </div>
    );
}

function App(props) {
  return(
    <div className="app">
      <Collection />
    </div>
  );
}

class Collection extends React.Component {
  //note that this is the container that will house the drag/drop containers
  constructor(props) {
    super(props);
    this.state = {
      owned: initializeCollection(true),
      unowned: initializeCollection(false)
    }
    this.myCallback = this.myCallback.bind(this);
  }

  // callback needed to pass data from child back to parent
  myCallback = (id, isOwned) => {
    //TODO check function behavior when dragging into own category
    if (isOwned) { // dragged to owned, need to put it in the owned array now
      // find the entry (it started in the unowned array)
      var oldOwnedArray,
          newOwnedArray,
          oldUnownedArray,
          newUnownedArray,
          unownedBookEntry,
          index;
      for (let i in this.state.unowned) {
        if (this.state.unowned[i].key === id) {
          unownedBookEntry = this.state.unowned[i];
          index = i;
          break;
        }
      }
      // remove it from unowned array
      oldUnownedArray = this.state.unowned;
      delete oldUnownedArray[index];
      newUnownedArray = oldUnownedArray;
      this.setState({unowned: newUnownedArray});
      // add it to the owned array
      oldOwnedArray = this.state.owned;
      oldOwnedArray.push(unownedBookEntry);
      newOwnedArray = oldOwnedArray;
      this.setState({owned: newOwnedArray});
      //TODO update the data model
      //TODO sort alphabetize the arrays
    } else { // dragged to unowned, need to put it in the unowned array now
      var ownedBookEntry;
      for (let i in this.state.owned) {
        if (this.state.owned[i].key === id) {
          ownedBookEntry = this.state.owned[i];
          index = i;
          break;
        }
      }
      // remove it from owned array
      oldOwnedArray = this.state.owned;
      delete oldOwnedArray[index];
      newOwnedArray = oldOwnedArray;
      this.setState({owned: newOwnedArray});
      // add it to the unowned array
      oldUnownedArray = this.state.unowned;
      oldUnownedArray.push(ownedBookEntry);
      newUnownedArray = oldUnownedArray;
      this.setState({unowned: newUnownedArray});
      //TODO update the data model
      //TODO sort alphabetize the arrays
    }
  }

  render() {

    return (
      <div className="collection-manager container-drag">
        <div className="dashboard">Collection Manager</div>
        <Owned
          owned = {this.state.owned}
          callbackFromParent={this.myCallback}
        />
        <Unowned
          unowned = {this.state.unowned}
          callbackFromParent={this.myCallback}
        />
      </div>
    );
  }
}

class Owned extends React.Component {

  ownershipCategoryCallToParent = (id, isOwned) => {
    this.props.callbackFromParent(id, isOwned); // pass data back to parent
  }

  onDrop = (event, isOwned) => {
    var id = event.dataTransfer.getData("text/plain");
    this.ownershipCategoryCallToParent(id, isOwned);
  }

  render() {

    return (
      <div className="owned-category">
        <div className="category-bar">Owned</div>
        <div
          className="category-contents droppable"
          onDragOver={e => onDragOver(e)}
          onDrop={e => this.onDrop(e, true)}
        >
          {this.props.owned}
        </div>
      </div>
    );
  }
}

class Unowned extends React.Component {

  ownershipCategoryCallToParent = (id, isOwned) => {
    this.props.callbackFromParent(id, isOwned); // pass data back to parent
  }

  onDrop = (event, isOwned) => {
    var id = event.dataTransfer.getData("text/plain");
    this.ownershipCategoryCallToParent(id, isOwned);
  }

  render() {

    return(
      <div className="unowned-category">
        <div className="category-bar">Unowned</div>
        <div
          className="category-contents droppable"
          onDragOver={e => onDragOver(e)}
          onDrop={e => this.onDrop(e, false)}
        >
          {this.props.unowned}
        </div>
      </div>
    );
  }
}


class BookEntry extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      childIsHidden: true,
      colorPersist: false
    }
    this.onDragStart = this.onDragStart.bind(this);
    this.toggleHidden = this.toggleHidden.bind(this);
  }

  toggleHidden() {
    this.setState({
      childIsHidden: !this.state.childIsHidden,
      colorPersist: !this.state.colorPersist
    });
  }

  onDragStart = (event, title) => {
   event.dataTransfer.setData("text/plain", this.props.title)
  }

  render() {

    return (
      <div
        className = "draggable"
        draggable
        onDragStart = {this.onDragStart}
      >
        <div className = "book-entry">
          <span
            className={(this.state.colorPersist ? "colorOn" : "colorOff") + " entry-title"}
            onClick={this.toggleHidden}
            >
              <i className="fas fa-caret-down expand-entry" onClick={this.toggleHidden}></i>
              {this.props.title}
          </span>
          <span className="entry-date">{this.props.date}</span>
        </div>
        {!this.state.childIsHidden &&
          <BookExpanded
            fullTitle = {this.props.fullTitle}
            imageFile = {this.props.imageFile}
            description = {this.props.description}
          />}
      </div>
    );
  }
}

class BookExpanded extends React.Component {
  render() {

    return (
      <div
        className="book-expanded"
      >
        <div className="book-expanded-layout">
          <div className="book-image">
            <img src={require("../public/assets/" + this.props.imageFile)} alt="no img"></img>
          </div>
          <div className="book-info">
            <p><span>Full Title:</span> {this.props.fullTitle}</p>
            <p><span>Description:</span> {this.props.description}</p>
          </div>
        </div>
      </div>
    );
  }
}

// Event Handler
function onDragOver(event) {
  event.preventDefault();
}

// Initialization
function initializeCollection(bGetOwned) {
  var array = [];
  Object.keys(allBooks).forEach((entry) => {
    if (allBooks[entry].ownership === bGetOwned) {
      array.push(
          <BookEntry
            key = {allBooks[entry].title} // refactor key/title
            date = {allBooks[entry].date}
            title = {allBooks[entry].title}
            fullTitle = {allBooks[entry].fullTitle}
            imageFile = {allBooks[entry].imageFile}
            description = {allBooks[entry].description}
          />
      );
    }
  });
  return array;
};


ReactDOM.render(
  <AppBackground />,
  document.getElementById('root')
);
