import './style.css';

const enqueueButton = document.querySelector<HTMLButtonElement>('#enqueue')!;
const searchButton = document.querySelector<HTMLButtonElement>('#search')!;

const cpfsToEnqueueTextArea =
  document.querySelector<HTMLInputElement>('#cpfs-to-enqueue')!;
const cpfToSearchInput =
  document.querySelector<HTMLInputElement>('#cpf-to-search')!;

const benefitsSearchResultDiv =
  document.querySelector<HTMLDivElement>('#benefits')!;

// Enqueue CPFs to fetch benefits
// eslint-disable-next-line @typescript-eslint/no-misused-promises
enqueueButton.addEventListener('click', async () => {
  try {
    const cpfs = cpfsToEnqueueTextArea.value.split('\n');
    if (!cpfs.length) return alert('Nenhum CPF informado');

    const response = await fetch(
      `${import.meta.env.VITE_BENEFITS_API_URL}/benefits/enqueue`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ cpfs }),
      },
    );

    if (response.ok) return alert('CPFs enviados para processamento');

    return alert(`${response.status}: ${response.statusText}`);
  } catch {
    alert('Não foi possível enviar os CPFs para processamento');
  }
});

// Search benefits by CPF
// eslint-disable-next-line @typescript-eslint/no-misused-promises
searchButton.addEventListener('click', async () => {
  try {
    const cpf = cpfToSearchInput.value;
    if (!cpf) return alert('Nenhum CPF informado');

    const response = await fetch(
      `${import.meta.env.VITE_BENEFITS_API_URL}/benefits/search`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ cpf }),
      },
    );

    if (response.ok) {
      const body = (await response.json()) as {
        hits: [
          {
            benefits: [
              {
                numero_beneficio: string;
                codigo_tipo_beneficio: string;
              },
            ];
          },
        ];
      };
      if (!body.hits.length)
        return alert('Nenhum benéficio para esse CPF encontrado');

      benefitsSearchResultDiv.innerHTML = `
        <ul>
          ${body.hits[0].benefits
            .map(
              (benefit) =>
                `<li>Número: ${benefit.numero_beneficio}, Tipo: ${benefit.codigo_tipo_beneficio}</li>`,
            )
            .join('')}
        </ul>
      `;

      return;
    }

    return alert(`${response.status}: ${response.statusText}`);
  } catch {
    alert('Não foi possível buscar os benefícios');
  }
});
