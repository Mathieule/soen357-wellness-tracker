/**
 * C2 Initial questionnaire. One question per page, a horizontal bar between
 * the question and its answers, answers 16 px apart.
 * Keyboard focus starts on the first answer, goes through every answer, then
 * reaches the Next / Create my dashboard button.
 * If no answer is selected, an error message says one must be chosen.
 */
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { useAppData } from '@shared/data/appData';
import type { Frequency, MetricId, Persona } from '@shared/data/types';
import { queueFlash, useFlash } from '@shared/lib/useFlash';
import { Button } from '@shared/ui/button';
import { ChoiceList, type Choice } from '@shared/ui/choices';
import { StatusMessage } from '@shared/ui/status';

interface Question {
  id: 'frequency' | 'persona' | 'metrics';
  title: string;
  help: string;
  multiple?: boolean;
  choices: Choice<string>[];
  error: string;
}

export const QUESTIONS: Question[] = [
  {
    id: 'frequency',
    title: 'How often do you exercise?',
    help: 'Choose one answer.',
    choices: [
      { value: 'rarely', label: 'Rarely or never' },
      { value: '1-2', label: '1 to 2 times a week' },
      { value: '3-4', label: '3 to 4 times a week' },
      { value: '5+', label: '5 or more times a week' },
    ],
    error: 'Choose how often you exercise to continue.',
  },
  {
    id: 'persona',
    title: 'Which best describes your needs?',
    help: 'Choose one answer. You can change it later in your profile.',
    choices: [
      { value: 'casual', label: 'Casual', description: 'I want simple daily tracking.' },
      { value: 'performance', label: 'Performance', description: 'I train for performance and want detailed data.' },
    ],
    error: 'Choose the description that fits you best to continue.',
  },
  {
    id: 'metrics',
    title: 'What data is important to you?',
    help: 'Choose at least one. These will be shown on your dashboard.',
    multiple: true,
    choices: [
      { value: 'fitness', label: 'Fitness and activity', description: 'Workouts, steps, active minutes' },
      { value: 'nutrition', label: 'Nutrition', description: 'Calories and meals' },
      { value: 'sleep', label: 'Sleep', description: 'Sleep time and sleep stages' },
    ],
    error: 'Choose at least one type of data to create your dashboard.',
  },
];

export function QuestionnairePage() {
  const { completeQuestionnaire } = useAppData();
  const navigate = useNavigate();
  const [flash, setFlash] = useFlash();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<Question['id'], string[]>>({ frequency: [], persona: [], metrics: [] });
  const [error, setError] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const q = QUESTIONS[step];
  const last = step === QUESTIONS.length - 1;

  // Focus the first answer of each new question.
  useEffect(() => {
    formRef.current?.querySelector<HTMLInputElement>('input')?.focus();
    document.title = `Question ${step + 1} of ${QUESTIONS.length} – Wellness Tracker (Output B)`;
  }, [step]);

  const next = () => {
    setFlash(null);
    if (answers[q.id].length === 0) {
      setError(true);
      return;
    }
    setError(false);
    if (!last) return setStep(step + 1);
    // Keep the order in which the metrics appear in the question.
    const metrics = (['fitness', 'nutrition', 'sleep'] as MetricId[]).filter((m) => answers.metrics.includes(m));
    completeQuestionnaire({
      frequency: answers.frequency[0] as Frequency,
      persona: answers.persona[0] as Persona,
      metrics,
    });
    queueFlash({ kind: 'success', text: 'Your profile is saved and your dashboard is ready.' });
    navigate('/');
  };

  return (
    <main className="mx-auto flex min-h-dvh max-w-[480px] flex-col px-4 py-8">
      <p className="m-0 text-lg">
        Set up your profile · Question {step + 1} of {QUESTIONS.length}
      </p>
      <div
        className="mt-2 h-2 overflow-hidden rounded-full bg-raised"
        role="progressbar"
        aria-label="Questionnaire progress"
        aria-valuemin={1}
        aria-valuemax={QUESTIONS.length}
        aria-valuenow={step + 1}
      >
        <div className="h-full bg-sleep-accent" style={{ width: `${((step + 1) / QUESTIONS.length) * 100}%` }} />
      </div>

      {flash && <StatusMessage kind={flash.kind} className="mt-4">{flash.text}</StatusMessage>}

      <form
        ref={formRef}
        noValidate
        className="mt-6 flex flex-1 flex-col"
        onSubmit={(e) => {
          e.preventDefault();
          next();
        }}
      >
        <ChoiceList
          key={q.id}
          name={q.id}
          legend={
            <>
              <span className="block text-2xl">{q.title}</span>
              <span className="mt-2 block text-base font-normal">{q.help}</span>
              {/* C2: horizontal bar between the question and the answers */}
              <span aria-hidden="true" className="mt-4 block h-0.5 w-full bg-line" />
            </>
          }
          choices={q.choices}
          multiple={q.multiple}
          value={answers[q.id]}
          onChange={(v) => {
            setAnswers({ ...answers, [q.id]: v });
            if (v.length) setError(false);
          }}
          describedBy={error ? 'q-error' : undefined}
          invalid={error}
        />

        {error && (
          <div id="q-error" className="mt-4">
            <StatusMessage kind="error">{q.error}</StatusMessage>
          </div>
        )}

        <div className="mt-auto flex gap-3 pt-8">
          {step > 0 && (
            <Button variant="outline" size="lg" onClick={() => (setError(false), setStep(step - 1))}>
              Back
            </Button>
          )}
          <Button type="submit" size="lg" className="flex-1">
            {last ? 'Create my dashboard' : 'Next'}
          </Button>
        </div>
      </form>
    </main>
  );
}
