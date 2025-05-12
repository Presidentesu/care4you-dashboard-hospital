'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { db } from "@/config/firebaseConfig";
import { collection, addDoc, doc, updateDoc, getDoc } from "firebase/firestore";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";

export default function AppointmentForm({ params }: { params: { id?: string } }) {
  const router = useRouter();
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    hospitalName: "",
    hospitalID: "",
    app_date: format(new Date(), "yyyy-MM-dd"),
    app_time: "09:00",
    address: "",
    description: "",
  });
  const [loading, setLoading] = useState(false);
  const [currentHospital, setCurrentHospital] = useState("");

  useEffect(() => {
    const adminUser = JSON.parse(localStorage.getItem("adminUser") || "{}");
    if (adminUser.hospitalName) {
      setCurrentHospital(adminUser.hospitalName);
      setForm(prev => ({
        ...prev,
        hospitalName: adminUser.hospitalName,
        hospitalID: adminUser.hospitalId || ""
      }));
      
      // If editing, fetch the appointment data
      if (params.id) {
        fetchAppointment(params.id);
      }
    }
  }, [params.id]);

  const fetchAppointment = async (id: string) => {
    setLoading(true);
    try {
      const docRef = doc(db, "appointments", id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setForm({
          fullName: data.fullName || "",
          email: data.email || "",
          phoneNumber: data.phoneNumber || "",
          hospitalName: data.hospitalName || "",
          hospitalID: data.hospitalID || "",
          app_date: data.app_date || format(new Date(), "yyyy-MM-dd"),
          app_time: data.app_time || "09:00",
          address: data.address || "",
          description: data.description || "",
        });
      }
    } catch (error) {
      console.error("Error fetching appointment:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const payload = {
        ...form,
        app_date: form.app_date, // Already in correct format
      };

      if (params.id) {
        await updateDoc(doc(db, "appointments", params.id), payload);
      } else {
        await addDoc(collection(db, "appointments"), payload);
      }
      
      router.push("/appointments");
    } catch (error) {
      console.error("Error saving appointment:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading && params.id) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p>Loading appointment data...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="flex items-center mb-6">
        <Link href="/appointments" className="mr-4">
          <Button variant="default">&larr; Back</Button>
        </Link>
        <h1 className="text-2xl font-bold text-gray-800">
          {params.id ? "Edit Appointment" : "Create New Appointment"}
        </h1>
      </div>
      
      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hospital
              </label>
              <Input
                value={currentHospital}
                readOnly
                className="bg-gray-100"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name *
              </label>
              <Input
                placeholder="Patient's full name"
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                required
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <Input
                  placeholder="Patient's email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                  type="email"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number *
                </label>
                <Input
                  placeholder="Patient's phone"
                  value={form.phoneNumber}
                  onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date *
                </label>
                <Input
                  type="date"
                  value={form.app_date}
                  onChange={(e) => setForm({ ...form, app_date: e.target.value })}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Time *
                </label>
                <Input
                  type="time"
                  value={form.app_time}
                  onChange={(e) => setForm({ ...form, app_time: e.target.value })}
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address
              </label>
              <Input
                placeholder="Patient's address"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description / Notes
              </label>
              <Input
                placeholder="Any additional notes"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
            
            <div className="flex justify-end gap-3 pt-4">
              <Link href="/auth/dashboard/appointments">
                <Button type="button" variant="default">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                {params.id ? "Update Appointment" : "Create Appointment"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}