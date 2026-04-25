import { b as getAwardImageById, e as base64ToBuffer } from '../../../chunks/awards_9vu1RA00.mjs';
export { renderers } from '../../../renderers.mjs';

const prerender = false;
const GET = async ({ params }) => {
  const id = Number(params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return new Response("Invalid award id", { status: 400 });
  }
  const award = await getAwardImageById(id);
  if (!award) {
    return new Response("Award image not found", { status: 404 });
  }
  return new Response(base64ToBuffer(award.imageBase64), {
    headers: {
      "content-type": award.imageMimeType,
      "cache-control": "public, max-age=3600"
    }
  });
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	GET,
	prerender
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
