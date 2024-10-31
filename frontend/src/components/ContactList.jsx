import { useEffect, useState } from "react";
import axios from "axios";

const ContactList = () => {
  const [contacts, setContacts] = useState([]);

  useEffect(() => {
    const fetchContacts = async () => {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/contacts`
      );
      setContacts(response.data);
    };
    fetchContacts();
  }, []);

  return (
    <ul>
      {contacts.map((contact) => (
        <li key={contact.id}>
          {contact.name} - {contact.email} - {contact.phone} - {contact.address}
        </li>
      ))}
    </ul>
  );
};

export default ContactList;
