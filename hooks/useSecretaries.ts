import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Secretary, SecretaryPermissions } from '../types';
import { User } from '@supabase/supabase-js';

export const useSecretaries = (user: User | null) => {
    const [secretaries, setSecretaries] = useState<Secretary[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            fetchSecretaries();
        } else {
            setSecretaries([]);
            setLoading(false);
        }
    }, [user]);

    const fetchSecretaries = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('secretary_access')
                .select('*')
                .eq('created_by', user?.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setSecretaries(data || []);
        } catch (error) {
            console.error('Error fetching secretaries:', error);
        } finally {
            setLoading(false);
        }
    };

    const addSecretary = async (secretary: Omit<Secretary, 'id' | 'created_at'>) => {
        try {
            const { data, error } = await supabase
                .from('secretary_access')
                .insert([{
                    ...secretary,
                    created_by: user?.id
                }])
                .select()
                .single();

            if (error) throw error;
            setSecretaries(prev => [data, ...prev]);
            return { data, error: null };
        } catch (error) {
            console.error('Error adding secretary:', error);
            return { data: null, error };
        }
    };

    const updateSecretary = async (id: string, updates: Partial<Secretary>) => {
        try {
            const { data, error } = await supabase
                .from('secretary_access')
                .update(updates)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            setSecretaries(prev => prev.map(s => s.id === id ? data : s));
            return { data, error: null };
        } catch (error) {
            console.error('Error updating secretary:', error);
            return { data: null, error };
        }
    };

    const deleteSecretary = async (id: string) => {
        try {
            const { error } = await supabase
                .from('secretary_access')
                .delete()
                .eq('id', id);

            if (error) throw error;
            setSecretaries(prev => prev.filter(s => s.id !== id));
            return { error: null };
        } catch (error) {
            console.error('Error deleting secretary:', error);
            return { error };
        }
    };

    return {
        secretaries,
        loading,
        addSecretary,
        updateSecretary,
        deleteSecretary,
        refreshSecretaries: fetchSecretaries
    };
};
