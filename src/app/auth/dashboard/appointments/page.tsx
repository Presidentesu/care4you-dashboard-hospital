'use client';

import { useEffect, useState } from "react";
import { db } from "@/config/firebaseConfig";
import { collection, getDocs, query, where, deleteDoc, doc } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import Link from "next/link";

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<{ 
    id: string; 
    fullName?: string; 
    email?: string; 
    phoneNumber?: string; 
    hospitalName?: string; 
    hospitalID?: string; 
    app_date?: string; 
    app_time?: string;
    address?: string; 
    description?: string; 
  }[]>([]);
  const [currentHospital, setCurrentHospital] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const adminUser = JSON.parse(localStorage.getItem("adminUser") || "{}");
    if (adminUser.hospitalName) {
      setCurrentHospital(adminUser.hospitalName);
      fetchAppointments(adminUser.hospitalName);
    }
  }, []);

  const fetchAppointments = async (hospitalName: string) => {
    try {
      const q = query(
        collection(db, "appointments"),
        where("hospitalName", "==", hospitalName)
      );
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => ({ 
        id: doc.id, 
        ...(doc.data() as { 
          fullName?: string; 
          email?: string; 
          phoneNumber?: string; 
          hospitalName?: string; 
          hospitalID?: string; 
          app_date?: string; 
          app_time?: string;
          address?: string; 
          description?: string; 
        }) 
      }));
      
      // Sort appointments by date and time
      data.sort((a, b) => {
        const dateA = new Date(`${a.app_date}T${a.app_time || '00:00'}`);
        const dateB = new Date(`${b.app_date}T${b.app_time || '00:00'}`);
        return dateA.getTime() - dateB.getTime();
      });
      
      setAppointments(data);
    } catch (error) {
      console.error("Error fetching appointments:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this appointment?")) {
      try {
        await deleteDoc(doc(db, "appointments", id));
        fetchAppointments(currentHospital);
      } catch (error) {
        console.error("Error deleting appointment:", error);
      }
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">
          Appointments for {currentHospital}
        </h1>
        <p className="text-gray-600 mt-2">
          {appointments.length} upcoming appointment{appointments.length !== 1 ? 's' : ''}
        </p>
      </div>

      {appointments.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg">
          <p className="text-gray-500 text-lg">No appointments scheduled</p>
        </div>
      ) : (
        <div className="space-y-6">
          {appointments.map((appointment) => (
            <Card key={appointment.id} className="hover:shadow-md transition-shadow border-l-4 border-blue-500">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-xl font-bold text-gray-800">
                        {appointment.fullName}
                      </h3>
                      <span className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full">
                        {appointment.app_time || "No time set"}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <p className="text-gray-600">
                        <span className="font-medium">Email:</span> {appointment.email}
                      </p>
                      <p className="text-gray-600">
                        <span className="font-medium">Phone:</span> {appointment.phoneNumber}
                      </p>
                    </div>
                    
                    <div className="mt-3">
                      <p className="text-lg font-semibold text-gray-700">
                        {appointment.app_date ? format(new Date(appointment.app_date), "EEEE, MMMM do yyyy") : "No date set"}
                      </p>
                    </div>
                    
                    {appointment.address && (
                      <p className="text-gray-600">
                        <span className="font-medium">Address:</span> {appointment.address}
                      </p>
                    )}
                    
                    {appointment.description && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <p className="text-gray-700">
                          <span className="font-medium">Notes:</span> {appointment.description}
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-col sm:flex-row md:flex-col gap-2 justify-end">
                    <Link href={`/auth/dashboard/appointments/edit/${appointment.id}`} className="w-full">
                      <Button variant="default" className="w-full">
                        Edit
                      </Button>
                    </Link>
                    <Button 
                      variant="destructive" 
                      onClick={() => handleDelete(appointment.id)}
                      className="w-full"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}