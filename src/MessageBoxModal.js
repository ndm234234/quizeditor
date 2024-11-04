import Modal from 'react-bootstrap/Modal'; 
import Button from "react-bootstrap/Button";

function MessageBoxModal({cancelButton = "Отмена", ... props}) {
    return (
        <Modal
            show={props.show}
            onHide={props.onCancel}
            backdrop="static"
            keyboard={true}
            centered
        >
          <Modal.Header closeButton>
          <Modal.Title>{props.title}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
              {props.query} 
          </Modal.Body>
          <Modal.Footer>
          <Button variant="secondary" onClick={props.onCancel}>{cancelButton}</Button>
          <Button variant="primary" onClick={props.OnOk}>{props.okButton}</Button>
          </Modal.Footer>
        </Modal>
    );
  }
  
export default MessageBoxModal;
