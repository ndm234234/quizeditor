import { useEffect, useState, useCallback } from "react";
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
  const pageSize = 11; // show row in table
  const titleBase = "Конструктор викторин";
  const [title, setTitle] = useState("");
  const [answers, setAnswers] = useState(null);
  const [question, setQuestion] = useState("Текст вопроса");
  const [savedQuestion, setSavedQuestion] = useState("");
  const [questionImage, setQuestionImage] = useState("");
  const [category, setCategory] = useState("Новая категория");
  const [score, setScore] = useState(10);
  const [info, setInfo] = useState("");
  const [infoImg, setInfoImg] = useState("");
  const [ready, setReady] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const [filterText, setFilterText] = useState("");
  const [filterReady, setFilterReady] = useState(true);
  const [filterNoReady, setFilterNoReady] = useState(true);
  const [filterWithInfo, setFilterWithInfo] = useState(true);
  const [filterWithNoInfo, setFilterWithNoInfo] = useState(true);

  const [showQuestionDetail, setShowQuestionDetail] = useState(false)
  const [fileName, setFileName] = useState("New.txt")
  const [showModalQueryDelete, setShowModalQueryDelete] = useState(false);

  const [showConfirmModalQueryConflict, setShowConfirmModalQueryConflict] = useState('');
  const [itemToSave, setItemToSave] = useState(null);

  const [indexToDelete, setIndexToDelete] = useState(-1);
  const [questionNameToDelete, setQuestionNameToDelete] = useState("");

  const [customData, setCustomData] = useState({ title: "", items: new Array() });

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const deleteConfirmed = () => {
    if (indexToDelete != -1) {
      setCustomData(prev => {
        const newItems = [...prev.items];
        newItems.splice(indexToDelete, 1);
        return { ...prev, items: newItems };
      });
      setIndexToDelete(-1);
      setQuestionNameToDelete("");
      setHasUnsavedChanges(true);
    }
    setShowModalQueryDelete(false);
  }

  const uniqueCategoriesCount = () => {
    return new Set(customData.items.map(item => item.category)).size;
  };

  const checkedQuestionCount = () => {
    return customData.items.filter(item => item.ready).length;
  };

  const createNewQuestion = () => {
    setScore(10);
    setQuestion("");
    setSavedQuestion("");
    setQuestionImage("");
    setAnswers(new Array());
    setInfo("");
    setInfoImg("");
    setShowQuestionDetail(true);
  }

  const createOrUpdateQuestion = (item) => {
    if (item.question != item.savedQuestion) {
      const indexToDelete = customData.items.findIndex(i => i.question == item.savedQuestion);
      if (indexToDelete != -1) {
        setCustomData(prev => {
          const newItems = [...prev.items];
          newItems.splice(indexToDelete, 1);
          return { ...prev, items: newItems };
        });
      }
    }

    const index = customData.items.findIndex(i => i.question == item.question);
    if (index == -1) {
      const newItems = [...customData.items, item];
      const pagesCount = Math.ceil(newItems.length / pageSize);
      // Обновляем состояние
      setCustomData(prev => ({
        ...prev,
        items: newItems
      }));
      setCurrentPage(pagesCount);
    }
    else {
      setCustomData(prev => {
        const newItems = [...prev.items];
        newItems[index] = item;
        return { ...prev, items: newItems };
      });
    }
    setHasUnsavedChanges(true);
  }

  const deleteQuestion = (item) => {
    const index = customData.items.findIndex(i => i.question == item.question);
    setIndexToDelete(index);
    setQuestionNameToDelete(item.question);
    if (index != -1) {
      setShowModalQueryDelete(true);
    }
  };

  const showQuestion = (item) => {
    setQuestion(item.question);
    setSavedQuestion(item.question);
    setQuestionImage(item.questionImage);
    const answers = new Set(item.answers);
    const newArray = item.options.map((value, index) => { return { name: value.name, img: value.img, correct: answers.has(index) ? 1 : 0, id: uuid() }; });
    setAnswers(newArray);
    setCategory(item.category);
    setScore(item.score);
    setInfo(item.info);
    setInfoImg(item.info_img);
    setReady(item.ready);

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

  function updateAnswerImg(img, index) {
    var newArray = answers.slice();
    newArray[index].img = img;
    setAnswers(newArray);
  }

  function deleteAnswer(index) {
    const newArray = [...answers.slice(0, index), ...answers.slice(index + 1)];
    setAnswers(newArray);
  }

  const filteredData = customData.items.filter((item) => {
    const whatSearch = filterText.toLowerCase();
    const itemReady = item.ready === true;
    
    const matchesReady = 
      (!filterReady && !filterNoReady) || // если ничего не выбрано — пропускаем
      (filterReady && itemReady) ||
      (filterNoReady && !itemReady);

    const hasInfo = item.info?.trim().length > 0;
    const matchesInfo = 
      (!filterWithInfo && !filterWithNoInfo) ||
      (filterWithInfo && hasInfo) ||
      (filterWithNoInfo && !hasInfo);

    return matchesReady && matchesInfo
      &&
      (item.question.toLowerCase().includes(whatSearch) || item.category.toLowerCase().includes(whatSearch));
  });

  const paginatedData = filteredData.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  useEffect(() => {
    setCurrentPage(1);
  }, []);

  useEffect(() => {
    document.title = (hasUnsavedChanges ? "* " : "") + titleBase + (title.length > 0 ? " [" + title + "]" : "");
  }, [title, hasUnsavedChanges]);

  useEffect(() => {
    // supress ecspace from MessageBoxModal
    const handleEscape = (e) => {
      if (e.key !== 'Escape') return;

      if (showConfirmModalQueryConflict.length > 0) {
        return;
      }

      setShowQuestionDetail(false);
    };

    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [showConfirmModalQueryConflict]);

  return (
    <div className="App">

      <MessageBoxModal show={showConfirmModalQueryConflict.length > 0}
        title="Внимание"
        query={showConfirmModalQueryConflict}
        okButton="Перезаписать"
        cancelButton="Отмена"
        onCancel={() => {
          setShowConfirmModalQueryConflict('')
        }
        }
        onOk={() => {
          createOrUpdateQuestion(itemToSave);
          setShowQuestionDetail(false);
          deleteConfirmed();
          setShowConfirmModalQueryConflict('');
        }} />

      <MessageBoxModal show={showModalQueryDelete}
        title="Удаление вопроса"
        query={questionNameToDelete}
        okButton="Удалить"
        cancelButton="Отмена"
        onCancel={() => setShowModalQueryDelete(false)}
        onOk={deleteConfirmed} />

      <QuestionTable visible={!showQuestionDetail}

        filterText={filterText} setFilterText={setFilterText}
        filterReady={filterReady} setFilterReady={setFilterReady}
        filterNoReady={filterNoReady} setFilterNoReady={setFilterNoReady}
        filterWithInfo={filterWithInfo} setFilterWithInfo={setFilterWithInfo}
        filterWithNoInfo={filterWithNoInfo} setFilterWithNoInfo={setFilterWithNoInfo}

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
        totalQuestions={customData.items.length}
        uniqueCategoriesCount={uniqueCategoriesCount()}
        checkedQuestionCount={checkedQuestionCount()}
        hasUnsavedChanges={hasUnsavedChanges}
        setHasUnsavedChanges={setHasUnsavedChanges}
        updateTitle={setTitle}
        setData={(data) => {
          setCustomData(data);
          setShowQuestionDetail(false);
        }} />

      <QuestionPanel visible={showQuestionDetail}
        category={category} setCategory={setCategory}
        score={score} setScore={setScore}
        question={question} setQuestion={setQuestion}
        savedQuestion={savedQuestion} setSavedQuestion={setSavedQuestion}
        questionImage={questionImage} setQuestionImage={setQuestionImage}
        answers={answers} setAnswers={setAnswers}
        deleteAnswer={deleteAnswer}
        updateAnswerText={updateAnswerText}
        updateAnswerImg={updateAnswerImg}
        updateAnswerCorrect={updateAnswerCorrect}
        info={info} setInfo={setInfo}
        infoImg={infoImg} setInfoImg={setInfoImg}
        ready={ready} setReady={setReady}
        save={(e) => {
          if (e.savedQuestion != e.question) {
            const index = customData.items.findIndex(i => i.question == e.question);
            if (index != -1) {
              setItemToSave(e);
              setShowConfirmModalQueryConflict("Существует другой вопрос с названием '" + e.question + "'.");
              return;
            }
          }
          createOrUpdateQuestion(e);
          setShowQuestionDetail(false);
        }}
        cancel={() => {
          setShowQuestionDetail(false);
        }} />
    </div>
  );
}

export default App;


