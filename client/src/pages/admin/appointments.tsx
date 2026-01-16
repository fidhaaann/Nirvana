import { useAppointments, useUpdateAppointment } from "@/hooks/use-dashboard";
import { AdminLayout } from "@/components/layout-admin";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { format, isSameDay } from "date-fns";
import { useState } from "react";
import { Clock, Phone, FileText, Check, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AppointmentsPage() {
  const { data: appointments, isLoading } = useAppointments();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const updateMutation = useUpdateAppointment();
  const { toast } = useToast();

  const filteredAppointments = appointments?.filter(apt => 
    date && isSameDay(new Date(apt.date), date)
  ).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const handleStatus = (id: number, status: 'confirmed' | 'cancelled' | 'completed') => {
    updateMutation.mutate({ id, status }, {
      onSuccess: () => toast({ title: `Appointment ${status}` })
    });
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h2 className="text-3xl font-display font-bold text-gray-900">Appointments</h2>
          <p className="text-muted-foreground">Manage bookings and schedule.</p>
        </div>

        <div className="grid lg:grid-cols-[350px_1fr] gap-8">
          <div className="space-y-6">
            <Card className="border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle>Select Date</CardTitle>
                <CardDescription>View appointments for specific day</CardDescription>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  className="rounded-md border shadow-none w-full flex justify-center"
                />
              </CardContent>
            </Card>
            
            <Card className="border-blue-100 bg-blue-50/50 shadow-none">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-blue-900">Next Appointment</p>
                    <p className="text-2xl font-bold text-blue-700">
                      {appointments?.filter(a => new Date(a.date) > new Date())[0] 
                        ? format(new Date(appointments.filter(a => new Date(a.date) > new Date())[0].date), "HH:mm") 
                        : "--:--"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              Schedule for {date ? format(date, "MMMM d, yyyy") : "Selected Date"}
              <Badge variant="secondary" className="ml-2">{filteredAppointments?.length || 0} bookings</Badge>
            </h3>

            {isLoading ? (
              <p>Loading schedule...</p>
            ) : filteredAppointments?.length === 0 ? (
              <div className="bg-gray-50 rounded-xl p-12 text-center border border-dashed border-gray-300">
                <p className="text-muted-foreground">No appointments scheduled for this day.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredAppointments?.map((apt) => (
                  <Card key={apt.id} className="border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-5 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                      <div className="flex gap-4">
                        <div className="flex flex-col items-center justify-center w-16 h-16 bg-gray-100 rounded-xl text-center">
                          <span className="text-xs font-bold text-gray-500 uppercase">{format(new Date(apt.date), "MMM")}</span>
                          <span className="text-xl font-bold text-gray-900">{format(new Date(apt.date), "d")}</span>
                          <span className="text-xs text-gray-500">{format(new Date(apt.date), "HH:mm")}</span>
                        </div>
                        <div>
                          <h4 className="font-bold text-lg text-gray-900">{apt.customerName}</h4>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                            <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {apt.contactInfo}</span>
                            {apt.notes && <span className="flex items-center gap-1"><FileText className="w-3 h-3" /> {apt.notes}</span>}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 w-full sm:w-auto">
                        <Badge className={
                          apt.status === 'confirmed' ? "bg-blue-100 text-blue-700" :
                          apt.status === 'completed' ? "bg-green-100 text-green-700" :
                          "bg-red-100 text-red-700"
                        } variant="outline">
                          {apt.status}
                        </Badge>
                        
                        {apt.status === 'confirmed' && (
                          <div className="flex gap-2 ml-auto">
                            <Button size="icon" variant="outline" className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50" onClick={() => handleStatus(apt.id, 'completed')}>
                              <Check className="w-4 h-4" />
                            </Button>
                            <Button size="icon" variant="outline" className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => handleStatus(apt.id, 'cancelled')}>
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
