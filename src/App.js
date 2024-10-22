import  { useEffect, useState, useCallback } from "react";
import * as React from 'react'
import logo from './logo.svg';

import './App.css';

import "bootstrap/dist/css/bootstrap.css";

import QuestionTable from './QuestionTable';
import QuestionPanel from './QuestionPanel';
import Form from 'react-bootstrap/Form';
import Button from "react-bootstrap/Button";
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Modal from 'react-bootstrap/Modal'; 

//import customData from './Mitino.json';
let customData = { title : "" , items : new Array() };

function App() {
  const pageSize = 5; // show row in table
  const [title, setTitle] = useState("");
  const [answers, setAnswers] = useState(null);
  const [question, setQuestion] = useState("Текст вопроса");
  const [category, setCategory] = useState("История");
  const [score, setScore] = useState(30);
  const [info, setInfo] = useState("");
  const [infoImg, setInfoImg] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchFilter, setSearchFilter] = useState(""); 
  const [questionDetail, setQuestionDetail] = useState(false)  
  const [fileName, setFileName] = useState("New.txt")
  const [showModalQuery, setShowModalQuery] = useState(false);

  const [indexToDelete, setIndexToDelete] = useState(-1);
  const [itemToDelete, setItemToDelete] = useState("");

  const handleCloseModal = () =>
    {
      if (indexToDelete != -1)
      {
        customData.items.splice(indexToDelete, 1);
        resetNewQuestion();
        setIndexToDelete(-1);
        setItemToDelete("");
      }
      setShowModalQuery(false);
    }
  const handleCancelModal = () => {
    setShowModalQuery(false);
  }

  const handleTitle = (e) => {
    setTitle(e);
    customData.title = e;
  };

  const handleFilter = (e) => {
    setSearchFilter(e.target.value);
  };

  const resetNewQuestion = () => {
    setCategory("История");
    setScore(30);
    setQuestion("");
    setAnswers(new Array());
    setInfo("");
    setInfoImg("");
  }

  const createNewQuestion = () => {
    resetNewQuestion();
    setQuestion("Новый вопрос");
    setQuestionDetail(true);
  }

  const createOrUpdateQuestion = (item) => {
    const index = customData.items.findIndex(i => i.question == item.question);
    if (index == -1)
    {
      customData.items.push(item);
      const pagesCount = Math.ceil(customData.items.length / pageSize);
      setCurrentPage(pagesCount);
    }
    else
    {
      customData.items[index] = item;
    }
    resetNewQuestion();
    setQuestionDetail(false);
  }

  const deleteQuestion = (item) => {
    const index = customData.items.findIndex(i => i.question == item.question);
    setIndexToDelete(index);
    setItemToDelete(item.question);
    if (index != -1)
    {
      setShowModalQuery(true);
    }
  };

 const showQuestion = (item) => {
    setQuestion(item.question);
    setInfo(item.info);
    setInfoImg(item.info_img);

    var answers = new Set(item.answers);
    var newArray = new Array();
    item.options.map((value, index) =>
    {
      newArray.push({ name : value, correct : answers.has(index) ? 1 : 0,  id : crypto.randomUUID() });
    });
    setAnswers(newArray);
    setCategory(item.category);
    setScore(item.score);
    setQuestionDetail(true);
  }

  function updateAnswerCorrect(correct, index) {
    var newArray = answers.slice();
    newArray[index].correct = correct;
    setAnswers(newArray);
  }

  function updateAnswer(text, index) {
    var newArray = answers.slice();
    newArray[index].name = text;
    setAnswers(newArray);
  }

  function deleteAnswer(index) {
    const newArray = [...answers.slice(0, index), ...answers.slice(index + 1)];
    setAnswers(newArray);
  }

  const filteredData = customData.items.filter(
    (item) =>
      item.question.toLowerCase().includes(searchFilter.toLowerCase())
  );

  const paginatedData = filteredData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  useEffect(() => {
    setCurrentPage(1);
  }, []);

  return (
    <div className="App">

<Modal
        show={showModalQuery}
        onHide={handleCancelModal}
        backdrop="static"
        keyboard={true}
      >
  <Modal.Header closeButton>
    <Modal.Title>Удаление вопроса</Modal.Title>
  </Modal.Header>
  <Modal.Body>
    {itemToDelete} 
  </Modal.Body>
  <Modal.Footer>
    <Button variant="secondary" onClick={handleCancelModal}>
      Отмена
    </Button>
    <Button variant="primary" onClick={handleCloseModal} >Удалить</Button>
  </Modal.Footer>
</Modal>

  <QuestionTable visible={!questionDetail} 
                 searchFilter={searchFilter} 
                 handleFilter={handleFilter} 
                 paginatedData={paginatedData} filteredData={filteredData} 
                 pageSize={pageSize} setCurrentPage={setCurrentPage}
                 showQuestion={showQuestion}
                 deleteQuestion={deleteQuestion}
                 createNewQuestion={createNewQuestion}
                 currentPage={currentPage}
                 fileName={fileName}
                 setFileName={setFileName}
                 customData={customData}
                 updateTitle={handleTitle}
                 setData={(data) => {
                  customData = data;
                  resetNewQuestion();
                  setQuestionDetail(false);
                 }}/>

   <QuestionPanel visible={questionDetail} 
                  category={category} setCategory={setCategory} 
                  score={score} setScore={setScore}
                  question={question} setQuestion={setQuestion}
                  answers={answers} setAnswers={setAnswers} 
                  deleteAnswer={deleteAnswer}
                  updateAnswer={updateAnswer}
                  updateAnswerCorrect={updateAnswerCorrect}
                  info={info} setInfo={setInfo}
                  infoImg={infoImg} setInfoImg={setInfoImg}
                  save ={createOrUpdateQuestion}
                  cancel={()=> 
                  {
                      resetNewQuestion();
                      setQuestionDetail(false);
                  }}/>
    </div>
  );
}

export default App;


