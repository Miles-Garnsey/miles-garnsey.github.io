(window.webpackJsonp=window.webpackJsonp||[]).push([[8],{71:function(e,t,n){"use strict";n.r(t),n.d(t,"readingTime",function(){return l}),n.d(t,"default",function(){return p}),n.d(t,"tableOfContents",function(){return d}),n.d(t,"frontMatter",function(){return h});var o=n(16),a=(n(0),n(22)),i=n(72),r=n.n(i),s=n(73),c=n.n(s),l={text:"9 min read",minutes:8.65,time:519e3,words:1730},b={},u="wrapper";function p(e){var t=e.components,n=Object(o.a)(e,["components"]);return Object(a.b)(u,Object.assign({},b,n,{components:t,mdxType:"MDXLayout"}),Object(a.b)("p",null,"As we all know, Go recently introduced generics as part of their 1.19 release. This has caused me personally no end of sadness, since every time I\u2019ve attempted to use them to solve problems (and believe me, we desperately need them to solve some big ones) I\u2019ve burned half a week deciphering cryptic compiler errors before giving up."),Object(a.b)("p",null,"This doesn\u2019t generally lead to a productive sprint. So I\u2019m here to discuss how to make this cursed syntax work."),Object(a.b)("h3",{id:"what-is-a-kubernetes-operator"},"What is a Kubernetes operator?"),Object(a.b)("div",{className:r.a.sidebarcontainer,style:{marginLeft:"0"}},Object(a.b)("span",null,Object(a.b)("figure",{className:r.a.figure},Object(a.b)("img",{src:c.a,className:r.a.image,alt:"A big set of neon gears and machinery."}),Object(a.b)("figcaption",null,"An actual Kubernete in the wild."))),Object(a.b)("span",{className:r.a.sidebar},Object(a.b)("h2",{id:"background"},"Background"),Object(a.b)("p",null,"As you may know, Kubernetes is a kind of operating system for data centers. It allows for scheduling workloads across a fleet of (possibly ever changing) nodes such that they enjoy elasticity and resilience. As well as scheduling workloads, it offers a variety of ways to manage networking and storage concerns, so that workloads have the routing, firewalling, authn/z and storage dependencies they need to run."),Object(a.b)("p",null,"Kubernetes operators are a way to hook into the Kubernetes infrastructure and build new pluggable functionality. They are particularly important for systems like Cassandra, where we often see complex operational procedures carried out. Running Cassandra is a full time job for many teams, and bootstrapping new nodes, replacing old ones, juggling token range movements, and securing network communications is complex."),Object(a.b)("p",null,"One open source project I work on is ",Object(a.b)("a",Object.assign({parentName:"p"},{href:"https://github.com/k8ssandra/k8ssandra-operator"}),"k8ssandra-operator"),", which aims to automate some of these concerns within Kubernetes clusters, and is where the insights in this blog post come from."))),Object(a.b)("h3",{id:"the-runtime-infrastructure"},"The runtime infrastructure"),Object(a.b)("p",null,"When building Kubernetes operators, we generally have a few pieces of tooling to make our lives bearable. We use ",Object(a.b)("inlineCode",{parentName:"p"},"kubebuilder")," to generate CRDs (custom resource definitions) which are JSON schemata that reside on the API server and provide validation for objects submitted to it. "),Object(a.b)("p",null,"Using ",Object(a.b)("inlineCode",{parentName:"p"},"kubebuilder"),", we write standard go structs, marked up with json tags like so:"),Object(a.b)("pre",null,Object(a.b)("code",Object.assign({parentName:"pre"},{}),'type GuestbookSpec struct {\n    Field1 string  `json:"field1"`\n    Field2 *string `json:"field2,omitempty"`\n}\n')),Object(a.b)("p",null,"These json tagged structs are then used to generate some CRD that looks something like ",Object(a.b)("a",Object.assign({parentName:"p"},{href:"https://github.com/k8ssandra/k8ssandra-operator/blob/main/config/crd/bases/k8ssandra.io_k8ssandraclusters.yaml"}),"this")," horror. You can see why you would never want to hand write it."),Object(a.b)("p",null,"Kubebuilder leverages ",Object(a.b)("inlineCode",{parentName:"p"},"controller-gen")," to generate some neccessary methods for each of our declared types, similar to the following:"),Object(a.b)("pre",null,Object(a.b)("code",Object.assign({parentName:"pre"},{}),"func (*GuestbookSpec in) DeepCopy(*Guestbook out) *Guestbook {}\nfunc (*GuestbookSpec in) DeepCopyInto()  {}\n")),Object(a.b)("p",null,"While each operator undertakes a unique set of steps to reconcile the resources under its control into a desired state, it is also the case that most reconciliation logic is broadly homogenous, following some steps similar to the following:"),Object(a.b)("ol",null,Object(a.b)("li",{parentName:"ol"},"Look for a resource with the same name on the cluster."),Object(a.b)("li",{parentName:"ol"},"Compare the current and desired states."),Object(a.b)("li",{parentName:"ol"},"If they do not match, perform an update.")),Object(a.b)("h2",{id:"the-problem"},"The problem"),Object(a.b)("p",null,"You\u2019d think that (given the reconciliation logic is the same across all Kubernetes objects) a single function could encapsulate it. But problematically, every resource has its own type in Go. As we know, historically in Golang it has not been easy to build generic functions that take a range of types, the Go idiom (according to the Go \u201cgurus\u201d I know) is to manually copy every piece of code for every type. Apparently this has absolutely ",Object(a.b)("em",{parentName:"p"},"nothing")," to do with the LOC metrics they produce - and I totally believe this."),Object(a.b)("p",null,"As a result, you end up with a range of functions that look like this:"),Object(a.b)("pre",null,Object(a.b)("code",Object.assign({parentName:"pre"},{}),"func ReconcileConfigMap(desiredObject corev1.ConfigMap)\nfunc ReconcilePod(desiredObject corev1.Pod)\n")),Object(a.b)("p",null,"Unfortunately for my team, this munchkinry led to duplication of the same logic approximately 15 times to date in our little corner of the reconciliation process, and the logic that was implemented in k8ssandra-operator began to diverge amongst the various authors."),Object(a.b)("p",null,"This state of affairs effectively broke encapsulation entirely, and no one was quite sure how to fix it (or whether it was fixable without some codegen horseshit - which would have again bumped our LOC metrics but also just sucks)."),Object(a.b)("h2",{id:"preliminary-work"},"Preliminary work"),Object(a.b)("p",null,"Let\u2019s kick off by scaffolding out a Kubernetes operator using kubebuilder, we\u2019ll use their Guestbook example with a few customisations to demonstrate this functionality."),Object(a.b)("p",null,"Start by ",Object(a.b)("a",Object.assign({parentName:"p"},{href:"https://book.kubebuilder.io/quick-start.html#installation"}),"installing")," kubebuilder, then run:"),Object(a.b)("pre",null,Object(a.b)("code",Object.assign({parentName:"pre"},{}),"mkdir -p ~/projects/guestbook\ncd ~/projects/guestbook\nkubebuilder init --domain github.com --repo github.com/miles-garnsey/golang-generics-demo\n")),Object(a.b)("p",null,"(Make sure you replace the domain and repo arguments with something appropriate for some Git server system that you own)."),Object(a.b)("p",null,"Or you can just check out my ",Object(a.b)("a",Object.assign({parentName:"p"},{href:"https://github.com/Miles-Garnsey/go-generics-blog/commit/262c1bb920ea9d6872083334c99007785c9f6fc2"}),"commit")," and be lazy, I won\u2019t know, I swear."),Object(a.b)("p",null,"Now scaffold the k8s APIs you want:"),Object(a.b)("pre",null,Object(a.b)("code",Object.assign({parentName:"pre"},{}),"kubebuilder create api --group webapp --version v1 --kind Guestbook\n")),Object(a.b)("p",null,"To make life easier, you\u2019ll want to add a few kubernetes modules like so:"),Object(a.b)("pre",null,Object(a.b)("code",Object.assign({parentName:"pre"},{}),"go get k8s.io/apimachinery/pkg/apis/meta/v1\ngo get k8s.io/client-go/kubernetes/fake\ngo get k8s.io/api/core/v1\n")),Object(a.b)("p",null,"Or again, just check out ",Object(a.b)("a",Object.assign({parentName:"p"},{href:"https://github.com/Miles-Garnsey/go-generics-blog/commit/d276fdd82e835d5a01d667a6231a830978979ccb"}),"my commit"),"."),Object(a.b)("p",null,"I won\u2019t be going into depth on these matters as a part of this blog post, suffice to say that there is API stuff we\u2019ll be working with."),Object(a.b)("div",{className:r.a.sidebarcontainer},Object(a.b)("span",{className:r.a.sidebar},Object(a.b)("h3",{id:"youll-want-to-have-tests"},"You\u2019ll want to have tests\u2026"),Object(a.b)("p",null,"It is worth taking a second here to note that this is one of those cases where you really, ",Object(a.b)("em",{parentName:"p"},"really"),", want to have tests as you\u2019re developing (i.e. do TDD). I came to several \u201csolutions\u201d in the course of exploring that couldn\u2019t be called with any variety of arguments. "),Object(a.b)("p",null,"If it doesn\u2019t pass tests, it isn\u2019t ANY sort of solution. We\u2019ll move onto creating one in a minute.")),Object(a.b)("span",{styles:{flexDirection:"column"}},Object(a.b)("h2",{id:"starting-in-on-a-solution"},"Starting in on a solution"),Object(a.b)("p",null,"Given that all Kubernetes object representations in Go should share a similar set of functions, one would expect that they should all fulfill a particular set of interfaces and therefore be somewhat fungible with respect to the reconciliation process."),Object(a.b)("p",null,"All that we need them to have in common are method calls such as ",Object(a.b)("inlineCode",{parentName:"p"},"DeepCopy"),", ",Object(a.b)("inlineCode",{parentName:"p"},"DeepCopyInto"),", and to fulfil the ",Object(a.b)("inlineCode",{parentName:"p"},"client.Object")," interface (from the Kubernetes client ",Object(a.b)("inlineCode",{parentName:"p"},"client-go"),") so that they can be used in calls such as ",Object(a.b)("inlineCode",{parentName:"p"},"client.Get"),", ",Object(a.b)("inlineCode",{parentName:"p"},"client.Update")," and the like."))),Object(a.b)("div",{style:{width:"100%",clear:"both"}}),Object(a.b)("h2",{id:"so-this-should-be-easy"},"So this should be easy\u2026"),Object(a.b)("p",null,"Famous last words. We know it won\u2019t be, or I wouldn\u2019t be writing a blog."),Object(a.b)("p",null,"In a rational world where language designers cast aside their sadism, and LOC metrics didn\u2019t exist, we could write a function with the following signature and a few example calls which would do the job:"),Object(a.b)("pre",null,Object(a.b)("code",Object.assign({parentName:"pre"},{}),"// in reconciliation/object.go\nfunc ReconcileObject(ctx context.Context, client kClient.Client, desiredObject client.Object) error {\n    desiredObjectName := types.NamespacedName{\n        Name:      desiredObject.GetName(),\n        Namespace: desiredObject.GetNamespace(),\n    }\n    var currentObject client.Object\n\n    err := kClient.Get(ctx, desiredObjectName, currentObject)\n    if err != nil {\n        return err\n    }\n    desiredObject.DeepCopyInto(currentObject)\n}\n")),Object(a.b)("p",null,"This function would run through the steps above before returning either an error or nil (for a successful result). We\u2019d call it as below:"),Object(a.b)("pre",null,Object(a.b)("code",Object.assign({parentName:"pre"},{}),"result := ReconcileObject(ctx, client desiredCM)\n")),Object(a.b)("p",null,"For a snapshot at this point (which will help with imports etc.) go ",Object(a.b)("a",Object.assign({parentName:"p"},{href:"https://github.com/Miles-Garnsey/go-generics-blog/commit/c84728b515aa759502662e1d4ad24a1f6f9272d2"}),"here"),"."),Object(a.b)("p",null,"But we don\u2019t live in a perfect world. If we try to compile code with the above function signature, what we\u2019ll find is that we get an error as follows:"),Object(a.b)("pre",null,Object(a.b)("code",Object.assign({parentName:"pre"},{}),"desiredObject.DeepCopyInto undefined (type client.Object has no field or method DeepCopyInto)\n")),Object(a.b)("p",null,Object(a.b)("em",{parentName:"p"},"(On more recent versions you seem to also get ",Object(a.b)("inlineCode",{parentName:"em"},"client.Object is not a type"),", which would have saved me a few hours!)")),Object(a.b)("p",null,"Fair enough, remember that ",Object(a.b)("inlineCode",{parentName:"p"},"DeepCopyInto")," is codegen\u2019ed (hello LOC!) by our frameworks, so it isn\u2019t actually part of ",Object(a.b)("inlineCode",{parentName:"p"},"client.Object"),". "),Object(a.b)("p",null,"Anyway, we all know how to define a composite interface to get us what we need here. We just need to embed ",Object(a.b)("inlineCode",{parentName:"p"},"client.Object")," in our own interface and off we go:"),Object(a.b)("pre",null,Object(a.b)("code",Object.assign({parentName:"pre"},{}),"type Reconcilable interface {\n    client.Object\n    DeepCopy() client.Object\n    DeepCopyInto(client.Object)\n}\n// New function signature:\nfunc ReconcileObject(ctx context.Context, kClient client.Client, desiredObject Reconcilable) error {}\n")),Object(a.b)("p",null,"So there\u2019s no problem here right? Everything appears to compile, so let\u2019s move on to creating a test for this:"),Object(a.b)("pre",null,Object(a.b)("code",Object.assign({parentName:"pre"},{}),'package reconciliation\n\nimport (\n    "context"\n    "testing"\n\n    "github.com/stretchr/testify/assert"\n    corev1 "k8s.io/api/core/v1"\n    metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"\n    "sigs.k8s.io/controller-runtime/pkg/client/fake"\n)\n\nfunc ReconcileObject_Test(t *testing.T) {\n    desiredObject := corev1.ConfigMap{\n        ObjectMeta: metav1.ObjectMeta{\n            Name:      "test-cm",\n            Namespace: "test-namespace",\n        },\n    }\n    ctx := context.Background()\n    client := fake.NewClientBuilder().\n        Build()\n\n    err := ReconcileObject(ctx, client, desiredObject)\n    assert.NoError(t, err)\n}\n')),Object(a.b)("p",null,"Another error:"),Object(a.b)("pre",null,Object(a.b)("code",Object.assign({parentName:"pre"},{}),'cannot use desiredObject (variable of type "k8s.io/api/core/v1".ConfigMap) as Reconcilable value in argument to ReconcileObject: "k8s.io/api/core/v1".ConfigMap does not implement Reconcilable (wrong type for method DeepCopy)\n        have DeepCopy() *"k8s.io/api/core/v1".ConfigMap\n        want DeepCopy() client.Object\n')),Object(a.b)("p",null,"Check ",Object(a.b)("a",Object.assign({parentName:"p"},{href:"https://github.com/Miles-Garnsey/go-generics-blog/commit/1a2de72fc9b5de0f1e81fb4079767dc1b5ecda57"}),"here")," for where the code is up to if you\u2019re lost."),Object(a.b)("h1",{id:"what-happened"},"What happened?"),Object(a.b)("p",null,"We can\u2019t necessarily use interfaces to solve this problem, even when we know that the types line up to the extent we need them to."),Object(a.b)("p",null,"Go doesn\u2019t do type inference on interface return types from methods in an interface. So implementors (i.e. ",Object(a.b)("inlineCode",{parentName:"p"},"ConfigMap"),") which return a concrete type (rather than the interface) will fail. This happens even though ",Object(a.b)("inlineCode",{parentName:"p"},"ConfigMap")," indeed fulfils ",Object(a.b)("inlineCode",{parentName:"p"},"client.Object")),Object(a.b)("p",null,"The Go \u201cidiom\u201d historically is to duplicate functions for every type, even when they\u2019re exactly the same. Consequently, Go engineers are among the most \u201cproductive\u201d in terms of LOC output."),Object(a.b)("h1",{id:"what-have-we-learned"},"What have we learned?"),Object(a.b)("p",null,"This problem basically comes down to one of the differences between Go and Java."),Object(a.b)("p",null,"In Java (which sucks in it\u2019s own special ways) oftentimes a committment on the part of an abstract member in an interface (which isn\u2019t even a thing in Go) to return an interface is acceptable. To the extent that a given group of interfaces may collaborate amongst themselves without really needing to know much about their underlying concrete types this is all fine. Yes, this does lead to excessive abstraction and certain types of obfuscation on the part of engineers keen to preserve their job security, but it is a different type of obfuscation to what we get with Go, where we have to explicitly re-write every function for every type."),Object(a.b)("p",null,"Go isn\u2019t really object oriented (which might be a good thing most of the time). There aren\u2019t really concepts like subtypes, supertypes or variance, and it is considered ",Object(a.b)("a",Object.assign({parentName:"p"},{href:"https://bryanftan.medium.com/accept-interfaces-return-structs-in-go-d4cab29a301b"}),"best practice")," (at least in some quarters\u2026) to always return a concrete (never an interface) type. So good luck trying to abstract logic across multiple types - it isn\u2019t easy."),Object(a.b)("p",null,"The next installment of this blog will fail a few more times to make this concept work with generics. (We\u2019ll succeed eventually, but I had to go through the journey and now so do you.)"))}p.isMDXComponent=!0;var d=function(){arguments.length>0&&void 0!==arguments[0]&&arguments[0];return[{id:"what-is-a-kubernetes-operator",level:3,title:"What is a Kubernetes operator?",children:[]},{id:"background",level:2,title:"Background",children:[{id:"the-runtime-infrastructure",level:3,title:"The runtime infrastructure",children:[]}]},{id:"the-problem",level:2,title:"The problem",children:[]},{id:"preliminary-work",level:2,title:"Preliminary work",children:[{id:"youll-want-to-have-tests",level:3,title:"You\u2019ll want to have tests\u2026",children:[]}]},{id:"starting-in-on-a-solution",level:2,title:"Starting in on a solution",children:[]},{id:"so-this-should-be-easy",level:2,title:"So this should be easy\u2026",children:[]}]},h={}},72:function(e,t,n){e.exports={image:"document_image__1chts",figure:"document_figure__2UQv0",sidebarcontainer:"document_sidebarcontainer__vLT14",floatright:"document_floatright__1MN0P",sidebar:"document_sidebar__GWdVn",rainbow:"document_rainbow__vQl_r","rainbow-bg":"document_rainbow-bg__3VYxN"}},73:function(e,t,n){e.exports=n.p+"static/media/gears1.b98b3853.PNG"}}]);
//# sourceMappingURL=8.431b4bd3.chunk.js.map