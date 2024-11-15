"use client";
import Link from "next/link";
import Usernavbar from "../components/Usernavbar";
import AdminNavbar from "../components/AdminNavbar";
import { useActionState, useEffect, useState, useRef } from "react";
import { it } from "node:test";

interface EventData { // data types expected when creating event object
  id: number;
  name: string;
  date: string;
  location: string;
  urgency: string;
  skills: string;
  description: string;
};

interface VolunteerData {
  id: number;
  address1: string;
  address2: string;
  age: string;
  city: string;
  date_joined: string;
  email: string;
  first_name: string;
  gender: string;
  is_active: boolean;
  is_staff: boolean;
  is_superuser: boolean;
  last_login: string | null;
  last_name: string;
  notififications: string;
  pfp: string;
  preferences: string;
  profilename: string;
  skills: string;
  state: string;
  username: string;
  zipcode: string;
  availability: Record<string, { startTime: string | null; endTime: string | null }>;
};

export default function Adminpage() {
    const [events, setEvent] = useState<EventData[]>([]);
    const [volunteerList, setVolunteerList] = useState<VolunteerData[]>([]);
    const [currVolunteers, setCurrVolunteers] = useState<VolunteerData[]>([]);
    const [filterEvent, setFilterEvent] = useState<EventData>();

    // Event attribute states
    const [name, setName] = useState<string>("");
    const [date, setDate] = useState<string>("");
    const [location, setLocation] = useState<string>("");
    const [urgency, setUrgency] = useState<string>("Not urgent");
    const [skills, setSkills] = useState<string[]>([]);
    const [description, setDescription] = useState<string>("");

    // Event update attribute states
    const [newName, setNewName] = useState<string>("");
    const [newDate, setNewDate] = useState<string>("");
    const [newLocation, setNewLocation] = useState<string>("");
    const [newUrgency, setNewUrgency] = useState<string>("");
    const [newSkills, setNewSkills] = useState<string[]>([]);
    const [newDescription, setNewDescription] = useState<string>("");

    // pop up form status
    const [popupOpen, setPopupOpen] = useState(false);
    const [togglePopup, setTogglePopup] = useState(false);
    const [currID, setCurrID] = useState<number | null>(null);

    const nameInputRef = useRef<HTMLInputElement>(null);
    const dateInputRef = useRef<HTMLInputElement>(null);
    const locationInputRef = useRef<HTMLInputElement>(null);
    const urgencyInputRef = useRef<HTMLSelectElement>(null);
    const skillsInputRef = useRef<HTMLSelectElement>(null);
    const descriptionInputRef = useRef<HTMLTextAreaElement>(null);

    const handleOpen = (pk: number) => {
      const itemToEdit = events.find(item => item.id == pk);
      
      if (itemToEdit) {
        setNewName(itemToEdit.name);
        setNewDate(itemToEdit.date);
        setNewLocation(itemToEdit.location);
        setNewDescription(itemToEdit.description);
        setCurrID(pk);
        setPopupOpen(true);
        setTogglePopup(prev => !prev);
      }
      else {
        console.log("Cant find item");
      }
    };

    const handleClose = () => {
      setPopupOpen(false);
    };

    const handleFormChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { target } = event;
      
      if (nameInputRef.current) {
        setNewName(nameInputRef.current!.value);
      }
      if (dateInputRef.current) {
        setNewDate(dateInputRef.current!.value);
      }
      if (locationInputRef.current) {
        setNewLocation(locationInputRef.current!.value);
      }
      if (urgencyInputRef.current) {
        setNewUrgency(urgencyInputRef.current!.value);
      }
      if (skillsInputRef.current) {
        const options = skillsInputRef.current!.selectedOptions;
        const selectedValues: string[] = [];

        for (let i = 0; i < options.length; i++) {
            if (options[i].selected) {
                selectedValues.push(options[i].value);
            }
        }

        setNewSkills(selectedValues);
      }
      if (descriptionInputRef.current) {
        setNewDescription(descriptionInputRef.current!.value);
      }
    };

    useEffect(() => {
      const itemToEdit = events.find(item => item.id === currID);
      if (!itemToEdit) {
        console.log("Event not found");
        return;
      }
      if (nameInputRef.current) {
        nameInputRef.current.value = itemToEdit.name;
      }
      if (dateInputRef.current) {
        dateInputRef.current.value = itemToEdit.date;
      }
      if (locationInputRef.current) {
        locationInputRef.current.value = itemToEdit.location;
      }
      if (urgencyInputRef.current) {
        urgencyInputRef.current.value = itemToEdit.urgency;
      }
      if (skillsInputRef.current) {
        const tempArr = itemToEdit.skills.split(',');
        Array.from(skillsInputRef.current.options).forEach(option => {
          option.selected = tempArr.includes(option.value);
        });
      }
      if (descriptionInputRef.current) {
        descriptionInputRef.current.value = itemToEdit.description;
      }
    }, [currID, events, togglePopup]);

    useEffect(() => {
        fetchEvents();
        fetchVolunteers();
    }, []);

    const fetchEvents = async() => {
        try {
            const response = await fetch("http://127.0.0.1:8000/api/events/");
            const data = await response.json();
            setEvent(data);
            // console.log(data);
        } 
        catch (err) {
            console.log(err);
        }
    };

    const handleSkillsSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const { options } = event.target;
        const selectedValues: string[] = [];

        for (let i = 0; i < options.length; i++) {
            if (options[i].selected) {
                selectedValues.push(options[i].value);
            }
        }

        setSkills(selectedValues);
    };

    const handleAddEventSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const t_skills = skills.join(',');
        const eventData = {
          name,
          date,
          location,
          urgency,
          skills: t_skills,
          description,
        };
        
        try {
          const response = await fetch("http://127.0.0.1:8000/api/events/create", {
            method: "POST",
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(eventData),
          });
          const t_data: EventData = await response.json();
          setEvent(prev => [...prev, t_data]);
        }
        catch (err) {
          // console.log(eventData);
          console.log(err);
        }
    };

    const handleUpdateEventSubmit = async(event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        console.log("this worked");

        const original = events.find(item => item.id === currID);
        if (!original) {
          console.log("Event not found");
          return;
        }

        const new_skills = newSkills.join(',');
        const eventNewData = {
          name: newName,
          date: newDate,
          location: newLocation,
          urgency: newUrgency,
          skills: new_skills,
          description: newDescription,
        };

        try {
          const response = await fetch(`http://127.0.0.1:8000/api/events/${currID}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(eventNewData),
          });
    
          const t_data: EventData = await response.json();
          setEvent((prev) => prev.map((item) => item.id == currID ? t_data : item)); // update event list after update change
          setPopupOpen(false);
        }
        catch (err) {
          console.log(err);
          setPopupOpen(false);
        }
    };

    const deleteEvent = async(pk: number) => {
        try {
          const response = await fetch(`http://127.0.0.1:8000/api/events/${pk}`, {
            method: "DELETE",
          });
    
          setEvent((prev) => prev.filter((item) => item.id !== pk)); // update event list after delete change
        } 
        catch (err) {
          console.log(err);
        }
    };

    const adminLogout = async() => {

    };

    const fetchVolunteers = async() => {
      try {
        const response = await fetch("http://127.0.0.1:8000/api/volunteers/");
        const data = await response.json();
        setVolunteerList(data);
        setCurrVolunteers(data);
        } 
        catch (err) {
            console.log(err);
        }
    }

    const filterVolunteers = async(event_item: EventData) => {
        try {
          const temp_id = event_item.id;
          const response = await fetch(`http://127.0.0.1:8000/api/events/one/${temp_id}`);
          const data = await response.json();
          setFilterEvent(data);
          const temp_skills = data.skills.split(',');

          let new_volunteers: VolunteerData[] = [];

          volunteerList.forEach((volunteer) => {
            const volunteer_skills = volunteer.skills.split(',');
            if (volunteer_skills.some(skill => temp_skills?.includes(skill))) {
              new_volunteers.push(volunteer);
            }
          });

          if (new_volunteers) {
            setCurrVolunteers(new_volunteers);
          }
          else {
            alert("No matching volunteers with needed skills");
          }
        }
        catch (err) {
          console.log(err);
        }
    };

    const resetVolunteers = () => {
      setCurrVolunteers(volunteerList);
    };

    const downloadPDF = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:8000/api/pdf`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/pdf',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to download PDF');
        }

        const blob = await response.blob();

        const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'report.pdf';
          document.body.appendChild(a);
          a.click();

          a.remove();
          window.URL.revokeObjectURL(url);
      } catch (error) {
        console.error('Error downloading PDF:', error);
      }
    };

    const downloadCSV = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:8000/api/csvreport`, {
          method: 'GET',
          headers: {
            'Content-Type': 'text/csv',
          },
        });

        if (!response.ok) {
          throw new Error('Cant download CSV');
        }

        const blob = await response.blob();
      
        const url = window.URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = 'report.csv';
        a.click();
        
        a.remove();
        window.URL.revokeObjectURL(url);
      }
      catch (err) {
        console.log(err);
      }
    };

    return (

      <div className="bg-slate-800 min-h-screen overflow-x-hidden">
        <AdminNavbar/>
        <div className="flex h-[90vh] border border-gray-700 rounded-md m-10">
            <div className="w-2/3 border-r border-gray-700 text-white p-10 overflow-auto">
                <h2 className="text-3xl font-bold text-white mb-5">Create Event</h2>
                <form onSubmit={handleAddEventSubmit} className="text-white">
                    <div className="mb-4">
                        <label htmlFor="event-name" className="">Event Name</label>
                        <input type="text" id="event-name" max-length="100" className="text-black mt-1 block w-full border-gray-300 rounded-md p-2" 
                        onChange={(e) => setName(e.target.value)} required />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="event-date" className="">Date</label>
                        <input type="date" id="event-date" className="text-black mt-1 block w-full border-gray-300 rounded-md p-2" placeholder="mm/dd/yy" 
                        onChange={(e) => setDate(e.target.value)} required />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="event-location" className="">Location</label>
                        <input type="text" id="event-location" className="text-black mt-1 block w-full border-gray-300 rounded-md p-2" 
                        onChange={(e) => setLocation(e.target.value)} required />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="event-urgency" className="mr-4">Urgency</label>
                        <select className="text-black rounded-md p-1" defaultValue={"Not urgent"} onChange={(e) => setUrgency(e.target.value)}>
                            <option value="Not urgent">Not urgent</option>
                            <option value="Urgent">Urgent</option>
                            <option value="Very urgent">Very urgent</option>
                        </select>
                    </div>
                    <div className="mb-4">
                        <label htmlFor="event-skills" className="block mb-4 mr-4">Required skills (Hold ctrl on Windows and hold cmd on Mac to multi-select) </label>
                        <select multiple className="text-black rounded-md p-1" value={skills} onChange={handleSkillsSelectChange}>
                            <option value="Problem solving">Problem solving</option>
                            <option value="Good with pets">Good with pets</option>
                            <option value="Good with kids">Good with kids</option>
                            <option value="Programming">Programming</option>
                            <option value="Leadership">Leadership</option>
                            <option value="Writing">Writing</option>
                            <option value="CPR certified">CPR certified</option>
                            <option value="Carpentry">Carpentry</option>
                            <option value="Cooking">Cooking</option>
                            <option value="Multilingual">Multilingual</option>
                            <option value="Creative arts">Creative arts</option>
                        </select>
                    </div>
                    <div className="mb-4">
                        <label htmlFor="event-description" className="">Description</label>
                        <textarea id="event-description" className="text-black mt-1 block w-full border-gray-300 rounded-md p-2"
                        onChange={(e) => setDescription(e.target.value)} required></textarea>
                    </div>
                    <button type="submit" className="w-full bg-blue-500 text-white font-semibold py-2 rounded-md hover:bg-blue-600">Create Event</button>
                </form>
            </div>
            <div className="w-1/3 text-3xl text-white p-10 overflow-auto">
                <p className="font-bold mb-5">Manage events</p>
                {/*<button className="w-auto mb-4 bg-gray-600 text-white text-sm p-3 rounded-md hover:bg-blue-700 transition-colors focus:ring-2 focus:ring-blue-500 focus:outline-none">
                  Filters...
                </button>*/}
                <div className="bg-slate-700 p-6 text-sm rounded-lg shadow-lg">
                  {/*<h2 className="text-1xl font-semibold text-white mb-6">Events</h2>*/}

                  {/* json data mapping */}
                  <ul className="space-y-6">

                    {events.map((item) => (
                      <li key={item.id} className="bg-slate-600 p-4 rounded-lg shadow hover:bg-slate-500 transition-colors">
                        <div className="flex justify-between">
                         <h3 className="text-lg font-medium text-white">{item.name}</h3>
                         <div className="space-x-2">
                          <button onClick = {() => handleOpen(item.id)} className="w-auto ml-auto bg-gray-800 text-white text-sm p-2 rounded-md hover:bg-blue-700 transition-colors focus:ring-2 focus:ring-blue-500 focus:outline-none">
                              Update Event
                            </button>
                              
                          <button onClick={() => deleteEvent(item.id)} className="w-auto ml-auto bg-gray-800 text-white text-sm p-2 rounded-md hover:bg-red-700 transition-colors focus:ring-2 focus:ring-blue-500 focus:outline-none">
                              Delete Event
                            </button>
                        </div>
                        </div>
                        <p className="text-slate-300">Date: {item.date}</p>
                        <p className="text-slate-300">Location: {item.location}</p>
                        <p className="text-slate-300">Description: {item.description}</p>
                        <p className="text-slate-300">Skills Needed: {item.skills}</p>
                        <p className="text-slate-300">Urgency: {item.urgency}</p>
                      </li>
                    ))}

                    
                    
                  </ul>
              </div>
            </div>
            
            {/*Event edit popup*/}
            {
              popupOpen && 
              <div className="fixed inset-0 m-0 flex items-center justify-center bg-black bg-opacity-20 max-w-screen max-h-screen">
                <div className="flex flex-col bg-slate-600 rounded-lg p-8 w-1/2">
                  <div className="flex justify-between">
                    <h2 className="text-3xl font-bold text-white mb-5">Update Event</h2>
                    <button onClick={() => handleClose()} className="text-2xl bg-red-600 hover:bg-red-800 w-10 h-10 pb-1 rounded-md text-white">&times;</button>
                  </div>

                  <form onSubmit={handleUpdateEventSubmit} className="text-white">
                    <div className="mb-4">
                        <label htmlFor="event-name" className="">Event Name</label>
                        <input type="text" id="event-name" max-length="100" className="text-black mt-1 block w-full border-gray-300 rounded-md p-2" 
                          onChange={handleFormChange} ref={nameInputRef} required />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="event-date" className="">Date</label>
                        <input type="date" id="event-date" className="text-black mt-1 block w-full border-gray-300 rounded-md p-2" placeholder="mm/dd/yy" 
                        onChange={handleFormChange} ref={dateInputRef} required />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="event-location" className="">Location</label>
                        <input type="text" id="event-location" className="text-black mt-1 block w-full border-gray-300 rounded-md p-2" 
                        onChange={handleFormChange} ref={locationInputRef} required />
                    </div>
                    <div className="mb-4">
                      <label htmlFor="event-urgency" className="mr-4">Urgency</label>
                      <select className="text-black rounded-md p-1" onChange={handleFormChange} ref={urgencyInputRef}>
                          <option value="Not urgent">Not urgent</option>
                          <option value="Urgent">Urgent</option>
                          <option value="Very urgent">Very urgent</option>
                      </select>
                    </div>
                    <div className="mb-4">
                        <label htmlFor="event-skills" className="block mb-4 mr-4">Required skills (Hold ctrl on Windows and hold cmd on Mac to multi-select) </label>
                        <select multiple className="text-black rounded-md p-1" onChange={handleFormChange} ref={skillsInputRef}>
                            <option value="Problem solving">Problem solving</option>
                            <option value="Good with pets">Good with pets</option>
                            <option value="Good with kids">Good with kids</option>
                            <option value="Programming">Programming</option>
                            <option value="Leadership">Leadership</option>
                            <option value="Writing">Writing</option>
                            <option value="CPR certified">CPR certified</option>
                            <option value="Carpentry">Carpentry</option>
                            <option value="Cooking">Cooking</option>
                            <option value="Multilingual">Multilingual</option>
                            <option value="Creative arts">Creative arts</option>
                        </select>
                    </div>
                    <div className="mb-4">
                        <label htmlFor="event-description" className="">Description</label>
                        <textarea id="event-description" className="text-black mt-1 block w-full border-gray-300 rounded-md p-2"
                        onChange={handleFormChange} ref={descriptionInputRef} required></textarea>
                    </div>
                    <button type="submit" className="w-full bg-blue-500 text-white font-semibold py-2 rounded-md hover:bg-blue-600">Update Event</button>
                  </form>
                </div>
              </div>
            }
        </div>

        <div className="flex flex-col h-full min-h-screen border border-gray-700 rounded-lg m-10 p-6 bg-slate-800 shadow-lg">
          <h1 className="text-3xl font-bold text-white mb-8">Manage Events</h1>

          {/* Filters Section */}
          <div className="grid grid-cols-4 gap-6 mb-8 items-end">

            {/* Skills */}
            <div className="flex flex-col">
              <label htmlFor="Skills" className="text-gray-300 mb-2">Skills</label>
              <select name="Skills" id="Skills" className="bg-slate-700 text-white p-3 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none" multiple size={4}>
                <option value="Good with pets">Good with pets</option>
                <option value="Good with kids">Good with kids</option>
                <option value="Programming">Programming</option>
                <option value="Leadership">Leadership</option>
                <option value="CPR certified">CPR certified</option>
                <option value="Carpentry">Carpentry</option>
                <option value="Cooking">Cooking</option>
                <option value="Multilingual">Multilingual</option>
                <option value="Creative arts">Creative arts</option>
              </select>
            </div>

            {/* Location */}  
            <div className="flex flex-col">
              <label htmlFor="Location" className="text-gray-300 mb-2">Location</label>
              <select name="Location" id="Location" className="bg-slate-700 text-white p-3 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none">
                <option value="houston">Houston, Texas</option>
                <option value="chicago">Chicago, Illinois</option>
                <option value="newyork">New York, New York</option>
                <option value="seattle">Seattle, Washington</option>
                <option value="la">Los Angeles, California</option>
              </select>
            </div>
    
            {/* Urgency */}
            <div className="flex flex-col">
              <label htmlFor="Urgency" className="text-gray-300 mb-2">Urgency</label>
              <select name="Urgency" id="Urgency" className="bg-slate-700 text-white p-3 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
    
            {/* Apply Filters Button */}
            <div className="flex items-end">
              <button className="w-auto bg-blue-600 text-white p-3 rounded-md hover:bg-blue-700 transition-colors focus:ring-2 focus:ring-blue-500 focus:outline-none">
                Apply filters
              </button>
            </div>
          </div>

          {/* Volunteers and Events Section */}
          <div className="grid grid-cols-2 gap-6">

            {/* Events List */}
            <div className="bg-slate-700 p-6 rounded-lg shadow-lg">
              <h2 className="text-2xl font-semibold text-white mb-6">Event</h2>
              <ul className="space-y-6">

                {events.map((item) => (
                  <li key={item.id} className="bg-slate-600 p-4 rounded-lg shadow hover:bg-slate-500 transition-colors">
                    <div className="flex justify-between">
                        <h3 className="text-lg font-medium text-white">{item.name}</h3>
                        <div className="space-x-2">
                          <button onClick={() => filterVolunteers(item)} className="w-auto ml-auto bg-gray-800 text-white text-sm p-2 rounded-md hover:bg-blue-700 transition-colors focus:ring-2 focus:ring-blue-500 focus:outline-none">
                               Filter/match volunteers
                          </button>
                        </div>
                    </div>
                    <p className="text-slate-300">Date: {item.date}</p>
                    <p className="text-slate-300">Location: {item.location}</p>
                    <p className="text-slate-300">Description: {item.description}</p>
                    <p className="text-slate-300">Skills Needed: {item.skills} </p>
                    <p className="text-slate-300">Urgency: {item.urgency}</p>
                  </li>
                  // Add 'send notifications' button with modal that accepts text


                  // Do volunteer-event matching module
                  // Use foreign keys?? Volunteers foreign key pointing to events' volunteer list
                ))}
                
              </ul>
            </div>

            {/* Volunteers List */}
            <div className="bg-slate-700 p-6 rounded-lg shadow-lg">
              <div className="flex justify-between">
                <h2 className="text-2xl font-semibold text-white mb-6">Volunteers</h2>
                <button onClick={() => resetVolunteers()} className="w-auto ml-auto bg-gray-800 text-white text-sm p-2 rounded-md hover:bg-blue-700 transition-colors focus:ring-2 focus:ring-blue-500 focus:outline-none">
                    Reset volunteer list
                </button>
              </div>
              <button className="w-auto mb-4 bg-gray-600 text-white text-sm p-3 rounded-md hover:bg-blue-700 transition-colors focus:ring-2 focus:ring-blue-500 focus:outline-none">Send Alert to Volunteers</button>
              <ul className="space-y-6">
                {currVolunteers.map((item) => (
                  <li key={item.id} className="flex items-center bg-slate-600 p-4 rounded-lg shadow hover:bg-slate-500 transition-colors">
                    <img src="https://picsum.photos/200" alt="placeholder" className="w-14 h-14 rounded-full mr-4"/>
                    <div>
                      <h3 className="text-lg font-medium text-white">{item.profilename}</h3>
                      <p className="text-slate-300">Age: {item.age}</p>
                      <p className="text-slate-300">Skills: {item.skills}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

        {/* PDF and CSV Report buttons */}
        <div className="flex justify-end items-center border-t border-gray-700 p-6 bg-slate-800 space-x-2">
          <span className="text-white mr-4">Download report:</span>
          <button onClick={downloadPDF} className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">PDF</button>
          <button onClick={downloadCSV} className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">CSV</button>
        </div>
      </div>
    </div>
    );
}