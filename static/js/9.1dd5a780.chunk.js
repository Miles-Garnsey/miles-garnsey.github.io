(window.webpackJsonp=window.webpackJsonp||[]).push([[9],{74:function(e,t,n){"use strict";n.r(t),n.d(t,"readingTime",function(){return s}),n.d(t,"default",function(){return d}),n.d(t,"tableOfContents",function(){return u}),n.d(t,"frontMatter",function(){return h});var a=n(16),i=(n(0),n(22)),c=n(75),o=n.n(c),r=n(76),l=n.n(r),s={text:"8 min read",minutes:7.4,time:444e3,words:1480},b={},p="wrapper";function d(e){var t=e.components,n=Object(a.a)(e,["components"]);return Object(i.b)(p,Object.assign({},b,n,{components:t,mdxType:"MDXLayout"}),Object(i.b)("p",null,"In our last installment we discussed why Go interfaces are different to Java interfaces and the ways in which they completely fail to help us make our functions more generic. "),Object(i.b)("p",null,"We also threw shade at all my possible future employers, alienated many future workmates, and wrote a number of career-limiting statements. I remind my readers that this blog represents my opinions and not those of my employer."),Object(i.b)("p",null,"The gist boiled down to the fact that an interface A which declares methods returning interface types B is not fulfilled by a type carrying correctly named methods with return types C which indeed fulfil the interface(s) B."),Object(i.b)("p",null,"In other words, a ",Object(i.b)("inlineCode",{parentName:"p"},"corev1.ConfigMap")," isn\u2019t a ",Object(i.b)("inlineCode",{parentName:"p"},"client.Object")," when it is used as a return type and the below interface definition is next to useless because nothing fulfils it:"),Object(i.b)("pre",null,Object(i.b)("code",Object.assign({parentName:"pre"},{}),"type Reconcilable interface {\n    client.Object\n    DeepCopy() client.Object\n    DeepCopyInto(client.Object)\n}\n")),Object(i.b)("div",{className:l.a.sidebarcontainer,style:{marginLeft:"0"}},Object(i.b)("span",null,Object(i.b)("figure",{className:l.a.figure},Object(i.b)("img",{src:o.a,className:l.a.image,alt:"A big set of neon gears and machinery."}),Object(i.b)("figcaption",null,"Another, more sinister Kubernete."))),Object(i.b)("span",{className:l.a.sidebar},Object(i.b)("h2",{id:"how-would-it-work-in-java"},"How would it work in Java?"),Object(i.b)("p",null,"In Java, we could justifiably write something like this and expect it to compile. "),Object(i.b)("p",null,"No need for generics or anything fancy. But as we\u2019ve discussed above, Go doesn\u2019t work the same way as Java when it comes to interface return types."),Object(i.b)("pre",null,Object(i.b)("code",Object.assign({parentName:"pre"},{}),"public interface IClientDotObject{}\n\npublic interface IReconciler extends IClientDotObject {\n    IClientDotObject DeepCopy();\n    void DeepCopyInto(IClientDotObject in);\n}\n\npublic class ConcreteCaller {\n    IReconciler desiredObject;\n    public void Reconcile() {\n        this.desiredObject.DeepCopy();\n        // etc.\n        ...\n    }\n}\n")),Object(i.b)("p",null,"What we are going to end up with is something that works the same way, but in Go we have additional hoops to jump through."))),Object(i.b)("h1",{id:"another-attempt-to-solve-this-shitshow"},"Another attempt to solve this shitshow"),Object(i.b)("p",null,"At this point (particularly if you are subject to an impending deadline), you ought to be feeling somewhat uncomfortable, perhaps your skin is crawling, and you may be feeling clammy. I often enjoy a whiskey at this point in the problem solving process, but you pick your poison."),Object(i.b)("div",{className:l.a.sidebarcontainer},Object(i.b)("span",null,Object(i.b)("h2",{id:"other-than-alcohol-abuse---what-are-our-options"},"Other than alcohol abuse - what are our options?"),Object(i.b)("p",null,"We know that we need to declare an interface which uses only concrete return types, and there\u2019s a way we can do it using the new generics feature in Go 1.19."),Object(i.b)("p",null,"If we examine the structure of our interface, we can see that it is as follows:"),Object(i.b)("pre",null,Object(i.b)("code",Object.assign({parentName:"pre"},{}),"type Reconcilable interface {\n    client.Object\n    DeepCopy() A POINTER TYPE\n    DeepCopyInto(A POINTER TYPE)\n}\n"))),Object(i.b)("span",null,Object(i.b)("iframe",{src:"https://giphy.com/embed/ggHmCDJXx4om4hNWbM",frameBorder:"0",class:"giphy-embed",style:{padding:".5rem",position:"sticky",top:"50%",maxWidth:"100%"}}))),Object(i.b)("h2",{id:"embedded-interfaces"},"Embedded interfaces"),Object(i.b)("p",null,Object(i.b)("inlineCode",{parentName:"p"},"client.Object")," is an embedded interface in this instance, it simply means that a type fulfilling ",Object(i.b)("inlineCode",{parentName:"p"},"Reconcilable")," fulfills everything client.Object does too. "),Object(i.b)("h2",{id:"type-parameters"},"Type parameters"),Object(i.b)("p",null,"We can also make this interface generic over some concrete types. Using the new type parameter syntax we can write this as follows:"),Object(i.b)("pre",null,Object(i.b)("code",Object.assign({parentName:"pre"},{}),"type Reconcilable[T any] interface {\n    client.Object\n    DeepCopy() T\n    DeepCopyInto(T)\n")),Object(i.b)("p",null,"Great, now (provided we make ",Object(i.b)("inlineCode",{parentName:"p"},"T")," concrete when calling functions taking ",Object(i.b)("inlineCode",{parentName:"p"},"Reconcileable")," arguments) we are returning only concrete types from our methods, while still asserting that Reconcilable fulfils ",Object(i.b)("inlineCode",{parentName:"p"},"client.Object"),". We just need to update our function signature:"),Object(i.b)("pre",null,Object(i.b)("code",Object.assign({parentName:"pre"},{}),"func ReconcileObject(ctx context.Context, kClient client.Client, desiredObject Reconcilable) error {}\n")),Object(i.b)("p",null,"Becomes:"),Object(i.b)("pre",null,Object(i.b)("code",Object.assign({parentName:"pre"},{}),"func ReconcileObject[U Reconcilable[U]](ctx context.Context, kClient client.Client, desiredObject U) error {}\n")),Object(i.b)("p",null,"See this ",Object(i.b)("a",Object.assign({parentName:"p"},{href:"https://github.com/Miles-Garnsey/go-generics-blog/commit/09a5318847cc54822c147a70e29c68ef5689d020"}),"commit"),"."),Object(i.b)("p",null,"Which just means that the type parameter ",Object(i.b)("inlineCode",{parentName:"p"},"U")," will take on whatever type is passed as the ",Object(i.b)("inlineCode",{parentName:"p"},"desiredObject")," argument, so if we pass a ",Object(i.b)("inlineCode",{parentName:"p"},"corev1.ConfigMap")," we\u2019ll have set ",Object(i.b)("inlineCode",{parentName:"p"},"U")," to the type ",Object(i.b)("inlineCode",{parentName:"p"},"ConfigMap")," and asserted that it must implement the two functions and one embdedded interface we\u2019ve declared as part of ",Object(i.b)("inlineCode",{parentName:"p"},"Reconcilable"),"."),Object(i.b)("p",null,"We\u2019ll get an error back though:"),Object(i.b)("pre",null,Object(i.b)("code",Object.assign({parentName:"pre"},{}),"cannot use currentObject (variable of type client.Object) as T value in argument to desiredObject.DeepCopyInto: need type assertion\n")),Object(i.b)("h2",{id:"swap-out-another-clientobject"},"Swap out another client.Object\u2026"),Object(i.b)("p",null,"Fine, you\u2019ll note we are still using ",Object(i.b)("inlineCode",{parentName:"p"},"client.Object")," as our type for currentObject, let\u2019s try and use ",Object(i.b)("inlineCode",{parentName:"p"},"Reconcileable[T]")," (which we\u2019ve aliased to ",Object(i.b)("inlineCode",{parentName:"p"},"U")," in this function\u2019s scope) instead:"),Object(i.b)("pre",null,Object(i.b)("code",Object.assign({parentName:"pre"},{}),"func ReconcileObject[U Reconcilable[U]](ctx context.Context, kClient client.Client, desiredObject U) error {\n    desiredObjectName := types.NamespacedName{\n        Name:      desiredObject.GetName(),\n        Namespace: desiredObject.GetNamespace(),\n    }\n    var currentObject U\n    err := kClient.Get(ctx, desiredObjectName, currentObject)\n    if err != nil {\n        return err\n    }\n    desiredObject.DeepCopyInto(currentObject)\n    return nil\n}\n")),Object(i.b)("h1",{id:"this-is-why-we-tdd"},"This is why we TDD"),Object(i.b)("p",null,"This is why it is nice to call our functions rather than just write them. Our code compiles, but the tests fail to compile."),Object(i.b)("pre",null,Object(i.b)("code",Object.assign({parentName:"pre"},{}),'func ReconcileObject_Test(t *testing.T) {\n    desiredObject := corev1.ConfigMap{\n        ObjectMeta: metav1.ObjectMeta{\n            Name:      "test-cm",\n            Namespace: "test-namespace",\n        },\n    }\n    ctx := context.Background()\n    client := fake.NewClientBuilder().\n        Build()\n\n    err := ReconcileObject(ctx, client, desiredObject)\n    assert.NoError(t, err)\n}\n')),Object(i.b)("pre",null,Object(i.b)("code",Object.assign({parentName:"pre"},{}),'"k8s.io/api/core/v1".ConfigMap does not implement Reconcilable["k8s.io/api/core/v1".ConfigMap] (wrong type for method DeepCopy)\n        have DeepCopy() *"k8s.io/api/core/v1".ConfigMap\n        want DeepCopy() "k8s.io/api/core/v1".ConfigMap\n')),Object(i.b)("p",null,"Firstly, note that the type inference is doing its work here. We didn\u2019t need to explicitly provide a type parameter in the call to ReconcileObject because the compiler has figured out that U is of type ",Object(i.b)("inlineCode",{parentName:"p"},"Reconcilable[corev1.ConfigMap]"),". Good."),Object(i.b)("p",null,"But we do have an error around the fact that the ConfigMap we\u2019ve passed is not allowed to call the methods defined on it, because they take a pointer receiver (e.g. they are defined as ",Object(i.b)("inlineCode",{parentName:"p"},"func (in *ConfigMap) DeepCopy() *ConfigMap"),"). "),Object(i.b)("p",null,"You\u2019ll recall in the last blog post that we mentioned that the fact that the receivers of DeepCopy and DeepCopyInto were pointers was ",Object(i.b)("strong",{parentName:"p"},"Important"),". "),Object(i.b)("p",null,"This is because (when dealing with generics) Go behaves somewhat poorly (people will try to justify this to you, don\u2019t let them). "),Object(i.b)("p",null,"While normally a block of code like this is valid:"),Object(i.b)("pre",null,Object(i.b)("code",Object.assign({parentName:"pre"},{}),"desiredObject := *corev1.ConfigMap{...}\ndesiredObject.MethodOnPointerReceiver()\ndesiredObject.SomeMethodOnNonPointerReceiver()\n")),Object(i.b)("div",{className:l.a.sidebarcontainer},Object(i.b)("span",null,Object(i.b)("iframe",{src:"https://giphy.com/embed/czYviM4rx9oxFliHHj",width:"400",height:"480",frameBorder:"0",class:"giphy-embed",allowFullScreen:!0,style:{padding:".5rem",maxWidth:"100%"}},'class="giphy-embed"')),Object(i.b)("span",null,Object(i.b)("p",null,"When passing types around as type parameters, you are alllowed to call ONLY the pointer or value type methods, depending on which is passed. "),Object(i.b)("p",null,Object(i.b)("strong",{parentName:"p"},"This is frankly hellacious. How do we fix it?")),Object(i.b)("p",null,"We can write something like this and make the ConfigMap a pointer, because then it fulfills the interface:"),Object(i.b)("pre",null,Object(i.b)("code",Object.assign({parentName:"pre"},{}),'func ReconcileObject_Test(t *testing.T) {\n    desiredObject := corev1.ConfigMap{\n        ObjectMeta: metav1.ObjectMeta{\n            Name:      "test-cm",\n            Namespace: "test-namespace",\n        },\n    }\n    ctx := context.Background()\n    client := fake.NewClientBuilder().\n        Build()\n\n    ReconcileObject(ctx, client, &desiredObject)\n}\n')),Object(i.b)("p",null,"See ",Object(i.b)("a",Object.assign({parentName:"p"},{href:"https://github.com/Miles-Garnsey/go-generics-blog/commit/1df9bc03a681f20b38d52f6a97d95cac767bb00d"}),"here")," for where the code is up to."))),Object(i.b)("h2",{id:"nope"},"Nope\u2026"),Object(i.b)("p",null,"But when we run this test, we error out with this error: ",Object(i.b)("inlineCode",{parentName:"p"},'"expected pointer, but got nil"'),". Why is this? Because we haven\u2019t allocated memory to ",Object(i.b)("inlineCode",{parentName:"p"},"currentObject")," by writing ",Object(i.b)("inlineCode",{parentName:"p"},"var currentObject U"),", we\u2019ve just declared a type. "),Object(i.b)("h1",{id:"allocating-memory-with-generics-and-new"},"Allocating memory with generics and new()"),Object(i.b)("p",null,"To allocate memory to a generic type, we need to use another new (I think?) language feature, the ",Object(i.b)("inlineCode",{parentName:"p"},"new()")," function. "),Object(i.b)("p",null,"By switching ",Object(i.b)("inlineCode",{parentName:"p"},"var currentObject U")," for ",Object(i.b)("inlineCode",{parentName:"p"},"currentObject := new(U)")," we can ensure that a real instance of the type ",Object(i.b)("inlineCode",{parentName:"p"},"U")," is created. "),Object(i.b)("p",null,"Change the function as per below (or this ",Object(i.b)("a",Object.assign({parentName:"p"},{href:"https://github.com/Miles-Garnsey/go-generics-blog/commit/ca76dc0b15edcff3261dbda30a9ff2fe08098f41"}),"commit"),") and let\u2019s try again:"),Object(i.b)("pre",null,Object(i.b)("code",Object.assign({parentName:"pre"},{}),"func ReconcileObject[U Reconcilable[U]](ctx context.Context, kClient client.Client, desiredObject U) error {\n    desiredObjectName := types.NamespacedName{\n        Name:      desiredObject.GetName(),\n        Namespace: desiredObject.GetNamespace(),\n    }\n    currentObject := new(U)\n    err := kClient.Get(ctx, desiredObjectName, currentObject)\n    if err != nil {\n        return err\n    }\n    desiredObject.DeepCopyInto(currentObject)\n    return nil\n}\n")),Object(i.b)("p",null,"Now we get a truly opaque error, as the compiler goes the full monty and moons us with its hairy ass:"),Object(i.b)("pre",null,Object(i.b)("code",Object.assign({parentName:"pre"},{}),"cannot use currentObject (variable of type *U) as client.Object value in argument to kClient.Get: *U does not implement client.Object (type *U is pointer to type parameter, not type parameter)\n")),Object(i.b)("p",null,"Now, I don\u2019t know what the ever living f&%$ that means, but I do know how to dereference a pointer, so let\u2019s see if that stops the compiler from exposing it\u2019s entirely ungroomed privates in our general direction:"),Object(i.b)("pre",null,Object(i.b)("code",Object.assign({parentName:"pre"},{}),"func ReconcileObject[U Reconcilable[U]](ctx context.Context, kClient client.Client, desiredObject U) error {\n    desiredObjectName := types.NamespacedName{\n        Name:      desiredObject.GetName(),\n        Namespace: desiredObject.GetNamespace(),\n    }\n    currentObject := new(U)\n    err := kClient.Get(ctx, desiredObjectName, *currentObject)\n    if err != nil {\n        return err\n    }\n    desiredObject.DeepCopyInto(*currentObject)\n    return nil\n}\n")),Object(i.b)("p",null,"Now once again, we get back the same error we received before ",Object(i.b)("inlineCode",{parentName:"p"},"expected pointer, but got nil"),". If we debug this function, we can see why, the type on our ",Object(i.b)("inlineCode",{parentName:"p"},"currentObject")," is ",Object(i.b)("inlineCode",{parentName:"p"},"*k8s.io/api/core/v1.ConfigMap nil"),"."),Object(i.b)("p",null,"See ",Object(i.b)("a",Object.assign({parentName:"p"},{href:"https://github.com/Miles-Garnsey/go-generics-blog/commit/e5a1ec91e1019481da2e136ff827a3c842df7692"}),"here")," for a commit."),Object(i.b)("h1",{id:"the-new-function-can-hurt-you"},"The new() function can hurt you"),Object(i.b)("p",null,"The reason for this is that ",Object(i.b)("inlineCode",{parentName:"p"},"new()")," always allocates the zero type for the passed type parameter. "),Object(i.b)("p",null,"What\u2019s our type parameter here? It is inferred from ",Object(i.b)("inlineCode",{parentName:"p"},"&desiredObject")," in this function call ",Object(i.b)("inlineCode",{parentName:"p"},"ReconcileObject(ctx, client, &desiredObject)"),", a pointer to a ConfigMap. What\u2019s the zero value of a pointer? Always nil."),Object(i.b)("h1",{id:"what-have-we-learned"},"What have we learned?"),Object(i.b)("p",null,"We\u2019ve learned that this shit is frustrating, and this was where I basically gave up; until, in a state of abject defeat while browsing Reddit on my phone, I found a post to a potential solution."),Object(i.b)("p",null,"I\u2019ll leave the links here as an exercise before our next installment. They convinced me the problem could be solved, but provided precisely zero help as to how to do so."),Object(i.b)("p",null,Object(i.b)("a",Object.assign({parentName:"p"},{href:"https://www.reddit.com/r/golang/comments/uqwh5d/generics_new_value_from_pointer_type_with/"}),"https://www.reddit.com/r/golang/comments/uqwh5d/generics_new_value_from_pointer_type_with/")),Object(i.b)("p",null,Object(i.b)("a",Object.assign({parentName:"p"},{href:"https://go.googlesource.com/proposal/+/refs/heads/master/design/43651-type-parameters.md#pointer-method-example"}),"https://go.googlesource.com/proposal/+/refs/heads/master/design/43651-type-parameters.md#pointer-method-example")))}d.isMDXComponent=!0;var u=function(){arguments.length>0&&void 0!==arguments[0]&&arguments[0];return[{id:"how-would-it-work-in-java",level:2,title:"How would it work in Java?",children:[]},{id:"other-than-alcohol-abuse---what-are-our-options",level:2,title:"Other than alcohol abuse - what are our options?",children:[]},{id:"embedded-interfaces",level:2,title:"Embedded interfaces",children:[]},{id:"type-parameters",level:2,title:"Type parameters",children:[]},{id:"swap-out-another-clientobject",level:2,title:"Swap out another client.Object\u2026",children:[]},{id:"nope",level:2,title:"Nope\u2026",children:[]}]},h={}},75:function(e,t,n){e.exports=n.p+"static/media/gears.e4894639.PNG"},76:function(e,t,n){e.exports={image:"document_image__1v_Cm",figure:"document_figure__3yTkH",sidebarcontainer:"document_sidebarcontainer__quzsW",floatright:"document_floatright__1ByNo",sidebar:"document_sidebar__1DteB",rainbow:"document_rainbow__1sJeL","rainbow-bg":"document_rainbow-bg__3rMHB"}}}]);
//# sourceMappingURL=9.1dd5a780.chunk.js.map