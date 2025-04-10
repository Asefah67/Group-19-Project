Project Title and Team Name: Study Buddy; Team 19

Application Description

Problem: Many students struggle with making connections with other students in their classes. Especially in larger lectures, it can be difficult to find an opportunity or avenue to meet and talk with those around you.

Solution: An application where students can connect with and form study groups with other students taking the same classes as them. A student can create a study group that others can join if they are also in the same course.

Key Features: This application will help address our problem because it will be a group of people who are looking for study partners so it takes off the added pressures of a student being afraid of cold real world introductions.

Why this project: Being in college can be an isolating and tumultuous experience for many students and the sheer number of other students they interact with on a daily can potentially be overwhelming. What this application entails to do is to help foster a sense of community between students while encouraging academic growth.

Team Member List:

Member 1: 
    {   Name: Ama Sefah
        Role: Project Manager
        Issues: 
            - Home Page/ Navigator Page
            - Study Group Creation Structure
            - In application communication between study groups
    }

Member 2:
   {     Name: Zuzia Varney 
        Role: Note Taker
        Issues:
            - Creating study group UI
            - Getting different data from canvas
   }

   
Member 3:
   {     Name: Chandra Chunduru 
        Role: Lead Developer and tester
        Issues:
            - Creating Group Design  
            - Data Scraping
            - Data Manipulation
   }


   ### Room Booking

Our room booking feature allows students to reserve a study room directly from within StudyBuddy. Users can choose from different locations, categories, and dates to view available time slots in a grid. They can select a preferred slot, review the booking details in a confirmation modal, and finally submit their booking. Once submitted, the reservation is saved locally (using IndexedDB), so students can see their chosen slot persist even if they refresh the page.

**How it works:**
- A dynamic grid of available time slots is generated from data stored in local JSON files.
- Filters let the user select a location, category, and date.
- Users can click on an available slot to select it. A trash icon lets them easily cancel that selection.
- A “Confirm” button opens a modal where they enter their name, an @umass.edu email, and the group size.
- When the booking is submitted, a confirmation message “Reservation stored locally” appears, and the reservation is saved via IndexedDB.

