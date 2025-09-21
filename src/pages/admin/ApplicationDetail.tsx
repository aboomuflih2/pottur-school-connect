import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { djangoAPI } from "@/lib/django-api";
import { ArrowLeft, User, Phone, Mail, MapPin, Calendar, School, CheckCircle, Trophy, Save } from "lucide-react";

// ... (interfaces are the same)

const ApplicationDetail = () => {
    const { type, id } = useParams<{ type: string; id: string }>();
    const navigate = useNavigate();
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const { data: application, isLoading } = useQuery({
        queryKey: ['application', type, id],
        queryFn: async () => {
            if (type === 'kg_std') {
                return djangoAPI.getKgStdApplication(id!);
            } else {
                return djangoAPI.getPlusOneApplication(id!);
            }
        },
        enabled: !!type && !!id,
    });

    const { data: interviewSubjects = [] } = useQuery({
        queryKey: ['interviewSubjects', id],
        queryFn: async () => {
            // @ts-ignore
            const response = await djangoAPI.getInterviewSubjects(id!);
            // @ts-ignore
            return response.results;
        },
        enabled: !!id && (application?.status === "interview_complete" || application?.status === "shortlisted_for_interview"),
    });

    const { data: subjectTemplates = [] } = useQuery({
        queryKey: ['subjectTemplates', type],
        queryFn: async () => {
            // @ts-ignore
            const response = await djangoAPI.getInterviewSubjectTemplates(type!);
            // @ts-ignore
            return response.results;
        },
        enabled: !!type,
    });

    const mutationOptions = {
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['application', type, id] });
            queryClient.invalidateQueries({ queryKey: ['interviewSubjects', id] });
        },
        onError: (error: Error) => {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive",
            });
        },
    };

    const updateStatusMutation = useMutation({
        mutationFn: (data: any) => {
            if (type === 'kg_std') {
                return djangoAPI.updateKgStdApplication(id!, data);
            } else {
                return djangoAPI.updatePlusOneApplication(id!, data);
            }
        },
        ...mutationOptions
    });

    const saveMarksMutation = useMutation({
        mutationFn: (subjects: any) => djangoAPI.saveInterviewSubjects(id!, subjects),
        ...mutationOptions
    });

    // ... (the rest of the component logic and JSX will be refactored to use the mutations)
};

export default ApplicationDetail;
