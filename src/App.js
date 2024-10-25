import  { useEffect, useState, useCallback } from "react";
import * as React from 'react'
import logo from './logo.svg';

import './App.css';

import "bootstrap/dist/css/bootstrap.css";

import QuestionTable from './QuestionTable';
import QuestionPanel from './QuestionPanel';
import MessageBoxModal from './MessageBoxModal.js';

import { uuid } from './tools.js';

//import loadedCustomData from './Mitino.json';

const useEscape = (onEscape) => {
  useEffect(() => {
      const handleEsc = (event) => {
          if (event.keyCode === 27) 
              onEscape();
      };
      window.addEventListener('keydown', handleEsc);

      return () => {
          window.removeEventListener('keydown', handleEsc);
      };
  }, []);
}

function App() {
  const pageSize = 10; // show row in table
  const [title, setTitle] = useState("");
  const [answers, setAnswers] = useState(null);
  const [question, setQuestion] = useState("Текст вопроса");
  const [category, setCategory] = useState("История");
  const [score, setScore] = useState(30);
  const [info, setInfo] = useState("");
  const [infoImg, setInfoImg] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchFilter, setSearchFilter] = useState(""); 
  const [showQuestionDetail, setShowQuestionDetail] = useState(false)  
  const [fileName, setFileName] = useState("New.txt")
  const [showModalQuery, setShowModalQuery] = useState(false);

  const [indexToDelete, setIndexToDelete] = useState(-1);
  const [itemToDelete, setItemToDelete] = useState("");

  const [customData, setCustomData] = useState({ title : "" , items : new Array() });

  const handleCloseModal = () => {
      if (indexToDelete != -1)
      {
        customData.items.splice(indexToDelete, 1);
        setIndexToDelete(-1);
        setItemToDelete("");
      }
      setShowModalQuery(false);
    }

  const handleCancelModal = () => {
    setShowModalQuery(false);
  }

  const handleFilter = (e) => {
    setSearchFilter(e.target.value);
  };

  const createNewQuestion = () => {
    setScore(30);
    setQuestion("");
    setAnswers(new Array());
    setInfo("");
    setInfoImg("");
    setShowQuestionDetail(true);
  }

  const createOrUpdateQuestion = (item) => {
    const index = customData.items.findIndex(i => i.question == item.question);
    if (index == -1) {
      customData.items.push(item);
      const pagesCount = Math.ceil(customData.items.length / pageSize);
      setCurrentPage(pagesCount);
    }
    else {
      customData.items[index] = item;
    }
  }

  const deleteQuestion = (item) => {
    const index = customData.items.findIndex(i => i.question == item.question);
    setIndexToDelete(index);
    setItemToDelete(item.question);
    if (index != -1) {
      setShowModalQuery(true);
    }
  };

 const showQuestion = (item) => {
    setQuestion(item.question);
    const answers = new Set(item.answers);
    var newArray = item.options.map((value, index) => { return { name : value, correct : answers.has(index) ? 1 : 0,  id : uuid() }; });
    setAnswers(newArray);
    setCategory(item.category);
    setScore(item.score);
    setInfo(item.info);
    setInfoImg(item.info_img);

    setShowQuestionDetail(true);
  }

  function updateAnswerCorrect(correct, index) {
    var newArray = answers.slice();
    newArray[index].correct = correct;
    setAnswers(newArray);
  }

  function updateAnswerText(text, index) {
    var newArray = answers.slice();
    newArray[index].name = text;
    setAnswers(newArray);
  }

  function deleteAnswer(index) {
    const newArray = [...answers.slice(0, index), ...answers.slice(index + 1)];
    setAnswers(newArray);
  }

  const filteredData = customData.items.filter((item) => item.question.toLowerCase().includes(searchFilter.toLowerCase()) || 
                                                         item.category.toLowerCase().includes(searchFilter.toLowerCase()));
                                                         
  const paginatedData = filteredData.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  useEffect(() => {
    setCurrentPage(1);
  }, []);

  useEscape(() => { setShowQuestionDetail(false);});


  return (
    <div className="App">

  <MessageBoxModal show={showModalQuery}  
                   title="Удаление"
                   query={itemToDelete}
                   cancelButton="Отмена"
                   okButton="Удалить"
                   onCancel={handleCancelModal} 
                   OnOk={handleCloseModal}   />

  <QuestionTable visible={!showQuestionDetail} 
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
                 title={title}
                 updateTitle={setTitle}
                 setData={(data) => {
                    setCustomData(data);
                    setShowQuestionDetail(false);
                 }}/>

   <QuestionPanel visible={showQuestionDetail} 
                  category={category} setCategory={setCategory} 
                  score={score} setScore={setScore}
                  question={question} setQuestion={setQuestion}
                  answers={answers} setAnswers={setAnswers} 
                  deleteAnswer={deleteAnswer}
                  updateAnswerText={updateAnswerText}
                  updateAnswerCorrect={updateAnswerCorrect}
                  info={info} setInfo={setInfo}
                  infoImg={infoImg} setInfoImg={setInfoImg}
                  save ={(e) => {
                    createOrUpdateQuestion(e);
                    setShowQuestionDetail(false);
                  }}
                  cancel={()=> {
                    setShowQuestionDetail(false);
                  }}/>
    </div>
  );
}

export default App;


