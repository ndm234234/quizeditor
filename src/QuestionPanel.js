import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import CloseButton from 'react-bootstrap/CloseButton';
import Button from "react-bootstrap/Button";
import ButtonGroup from 'react-bootstrap/ButtonGroup';


function QuestionPanel(props) {

  function uuid() {
    const url = URL.createObjectURL(new Blob())
    const [id] = url.toString().split('/').reverse()
    URL.revokeObjectURL(url)
    return id
  }

    if (!props.visible) 
    {
      return <div></div>
    }
    else 
    return (
      <><InputGroup className="mb-3">
          <InputGroup.Text>Категория вопроса</InputGroup.Text>
          <Form.Control 
            value={props.category}
            onChange={e => props.setCategory(e.target.value)} />
        </InputGroup>
        <InputGroup className="mb-3">
          <InputGroup.Text>Очки</InputGroup.Text>
          <Form.Control type="number"
            value={props.score}
            onChange={e => props.setScore(e.target.value)} />
        </InputGroup>
        <InputGroup className="mb-3">
          <InputGroup.Text>Вопрос</InputGroup.Text>
          <Form.Control
            type="text"
            placeholder="Введите вопрос"
            value={props.question}
            onChange={e => props.setQuestion(e.target.value)} />
        </InputGroup>
        <div>
          <Form.Label>Варианты ответов (<b>правильные выделите галочкой слева от ответа</b>)</Form.Label>
          <AnswersDisplay visible={props.visible} answers={props.answers} updateAnswer={props.updateAnswer} 
                          updateAnswerCorrect={props.updateAnswerCorrect} deleteAnswer={props.deleteAnswer} />
          <div className="buttonPanel">
              <Button onClick={() => {
                props.setAnswers(answers => [...answers, { name: "", correct: 0, id: uuid() }]);
              } }>Добавить ответ</Button>
          </div>
        </div>
        <div>
          <Form.Label>Информация о правильном ответе</Form.Label>
          <Form.Control placeholder="Дополнительная информация о правильном ответе" as="textarea" rows={5}
            value={props.info != null ? props.info : ""}
            onChange={e => props.setInfo(e.target.value)}/>
          <Form.Label>Изображение</Form.Label>
          <Form.Control placeholder="Название файла картинки или ссылка"
            value={props.infoImg != null ? props.infoImg : ""}
            onChange={e => props.setInfoImg(e.target.value)} />
        </div>
        <div className="buttonPanel">
            <ButtonGroup className="me-2">
                <Button onClick={() => { 
                    var item = 
                    {
                        question : props.question,
                        options : props.answers.map((item) => { return item.name;  }),
                        answers : props.answers.map((item, index) =>  { return { item : item, index : index}; }).filter((item) => item.item.correct).map((item) => {
                                return item.index;
                            }),
                        score : parseInt(props.score),
                        category : props.category,
                        info : props.info,
                        info_img : props.infoImg
                    }
                    props.save(item);
                }} >Сохранить</Button>
            </ButtonGroup>
            <ButtonGroup className="me-2" >
                <Button onClick={() => props.cancel()}
                 >Отмена</Button>
            </ButtonGroup>
        </div>
        </>
      );
  }
  
  function AnswersDisplay(props) {
    if (!props.visible) 
    {
      return <div></div>
    }
    else 
    return (
    <div>
        {props.answers.map((item, index) => {
          return (
            <div key={item.id}>
              <InputGroup className="mt-3 InputAnswers">
                <InputGroup.Checkbox aria-label="Checkbox for following text input" defaultChecked = {item.correct}
                onChange={(e) => props.updateAnswerCorrect(e.target.checked, index)}
                />
                <Form.Control placeholder="Введите ответ" defaultValue = {item.name}
                onChange={(e) => props.updateAnswer(e.target.value, index)}
                />
                <CloseButton className="closeButton" onClick={() => props.deleteAnswer(index)}/>
              </InputGroup>
            </div>
          );
        })}
      </div>
      );
  }
  
export default QuestionPanel;
