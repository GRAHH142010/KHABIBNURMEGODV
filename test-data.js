// Test script to add sample events with PDF links for demonstration
const fetch = require('node-fetch');

async function addSampleEvents() {
  const sampleEvents = [
    {
      title: "CULTURAL FINE ARTS - Painting Competition",
      description: "CULTURAL FINE ARTS|Painting Competition for all age groups",
      eventDate: "2024-06-15",
      endDate: "2024-06-20",
      deadline: "2024-06-14",
      venue: "DPS Art Studio",
      status: "open",
      category: "cultural",
      portalId: "dps-sample-001",
      pdfLinks: [
        "https://www.msdpssharjah.com/documents/cultural_arts_guidelines.pdf",
        "https://www.msdpssharjah.com/documents/registration_form.pdf"
      ]
    },
    {
      title: "LITERARY - Creative Writing Contest",
      description: "LITERARY|Creative Writing Contest in English and Arabic",
      eventDate: "2024-06-18",
      endDate: "2024-06-25",
      deadline: "2024-06-17",
      venue: "DPS Library",
      status: "open",
      category: "literary",
      portalId: "dps-sample-002",
      pdfLinks: [
        "https://www.msdpssharjah.com/documents/writing_contest_rules.pdf"
      ]
    },
    {
      title: "SPORTS - Football Tournament",
      description: "SPORTS|Inter-house Football Tournament",
      eventDate: "2024-06-22",
      endDate: "2024-06-28",
      deadline: "2024-06-20",
      venue: "DPS Sports Ground",
      status: "open",
      category: "sports",
      portalId: "dps-sample-003",
      pdfLinks: [
        "https://www.msdpssharjah.com/documents/sports_tournament_schedule.pdf",
        "https://www.msdpssharjah.com/documents/medical_clearance_form.pdf"
      ]
    }
  ];

  for (const event of sampleEvents) {
    try {
      const response = await fetch('http://localhost:5000/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
      });
      
      if (response.ok) {
        console.log(`Added event: ${event.title}`);
      } else {
        console.error(`Failed to add event: ${event.title}`);
      }
    } catch (error) {
      console.error(`Error adding event: ${event.title}`, error);
    }
  }
}

addSampleEvents();